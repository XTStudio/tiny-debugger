import * as http from "http";
import { EventEmitter } from "events";

class ClientEvent {

    constructor(readonly name: string, readonly params: any) { }

}

class Client extends EventEmitter {

    sendingTimer: any
    sendingEvents: ClientEvent[] = []

    constructor(readonly uuid: string) { super() }

    emitToClient(name: string, params: any = {}) {
        this.sendingEvents.push(new ClientEvent(name, params))
        if (this.sendingTimer === undefined) {
            this.sendingTimer = setTimeout(() => {
                this.emit("events")
                this.sendingTimer = undefined
            }, 100)
        }
    }

}

export class TinyDebugger extends EventEmitter {

    private clients: Client[] = []
    private breakpoints: string[] = []

    createServer(port: number = 8091) {
        http.createServer(async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.setHeader("Access-Control-Allow-Methods", "GET,POST")
            res.setHeader("Access-Control-Allow-Headers", "device-uuid")
            res.setHeader("Access-Control-Max-Age", 86000)
            if (req.method === "OPTIONS") { return this.resolve(res) }
            try {
                if (req.url === "/events") {
                    this.resolve(res, await this.events(req, res))
                    return
                }
                else if (req.url === "/connected") {
                    this.resolve(res, await this.connected(req, res))
                    return
                }
                else if (req.url === "/paused") {
                    this.resolve(res, await this.paused(req, res))
                    return
                }
                else if (req.url === "/breakpoints") {
                    this.resolve(res, { items: this.breakpoints })
                    return
                }
                else if (req.url) {
                    this.resolve(res, await this.customEvent(req, res))
                    return
                }
            } catch (error) {
                this.reject(res, error)
            }
        }).listen(port)
    }

    // Breakpoint Handlers

    setBreakpoints(bps: string[]) {
        this.breakpoints = bps
        this.clients.forEach(it => {
            it.emitToClient("updateBreakpoints")
        })
    }

    setBreakpoint(uri: string) {
        if (this.breakpoints.indexOf(uri) < 0) {
            this.breakpoints.push(uri)
            this.clients.forEach(it => {
                it.emitToClient("setBreakpoint", { uri })
            })
        }
    }

    removeBreakpoint(uri: string) {
        const idx = this.breakpoints.indexOf(uri)
        if (idx >= 0) {
            this.breakpoints.splice(idx, 1)
        }
        this.clients.forEach(it => {
            it.emitToClient("removeBreakpoint", { uri })
        })
    }

    removeAllBreakpoints() {
        this.breakpoints = []
        this.clients.forEach(it => {
            it.emitToClient("removeAllBreakpoints")
        })
    }

    // Client Event Handlers

    async events(req: http.IncomingMessage, res: http.ServerResponse) {
        const client = this.clientWithRequest(req)
        if (client) {
            if (client.sendingEvents.length > 0) {
                const events = client.sendingEvents
                client.sendingEvents = []
                return { events }
            }
            return new Promise<any>((resolver) => {
                client.once("events", () => {
                    const events = client.sendingEvents
                    client.sendingEvents = []
                    resolver({ events })
                })
            })
        }
        else {
            throw Error("device not found.")
        }
    }

    async connected(req: http.IncomingMessage, res: http.ServerResponse) {
        const deviceUUID = req.headers["device-uuid"]
        if (typeof deviceUUID === "string") {
            this.clients = this.clients.filter(it => it.uuid !== deviceUUID)
            const client = new Client(deviceUUID)
            this.clients.push(client)
            this.emit("client.connected", client)
            return { echo: "Hello, World!" }
        }
        else {
            throw Error("device-uuid required.")
        }
    }

    async paused(req: http.IncomingMessage, res: http.ServerResponse) {
        const client = this.clientWithRequest(req)
        if (client) {
            const params = await this.paramsFromRequest(req)
            this.emit("client.paused", client, params)
            return { result: "done" }
        }
        else {
            throw Error("device not found.")
        }
    }

    customEvent(req: http.IncomingMessage, res: http.ServerResponse) {
        const client = this.clientWithRequest(req)
        const event = req.url ? req.url.replace("/", "") : undefined
        if (client && event && event.length > 0) {
            return new Promise<any>((resolver) => {
                client.once(event, (params: any) => {
                    resolver(params)
                })
            })
        }
        else {
            throw Error("device-uuid and event required.")
        }
    }

    clientWithRequest(req: http.IncomingMessage): Client | undefined {
        const deviceUUID = req.headers["device-uuid"]
        if (typeof deviceUUID === "string") {
            return this.clients.filter(it => it.uuid === deviceUUID)[0]
        }
        else {
            return undefined
        }
    }

    paramsFromRequest(req: http.IncomingMessage) {
        return new Promise((resolver, rejector) => {
            let body: any[] = []
            req.on('error', (err) => {
                rejector(err)
            }).on('data', (chunk) => {
                body.push(chunk)
            }).on('end', () => {
                try {
                    resolver(JSON.parse(Buffer.concat(body).toString()))
                } catch (error) {
                    resolver({})
                }
            });
        })
    }

    resolve(res: http.ServerResponse, message: any = {}) {
        res.statusCode = 200
        res.write(JSON.stringify(message))
        res.end()
    }

    reject(res: http.ServerResponse, error: Error) {
        res.statusCode = 400
        res.write(JSON.stringify({ error: error.message }))
        res.end()
    }

}