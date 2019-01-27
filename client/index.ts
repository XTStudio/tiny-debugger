declare var XTSHttpRequest: any
declare var UIDevice: any

class $__Connector {

    delegate: $__Debugger | undefined = undefined

    deviceUUID: string = (() => {
        if (typeof navigator === "object") {
            return "Browser " + Date.now()
        }
        else if (typeof UIDevice === "object") {
            return UIDevice.current.identifierForVendor
        }
        return ""
    })()

    serverAddress = (() => {
        if (typeof window === "object") {
            return window.location.hostname + ":8091"
        }
        return "127.0.0.1:8091"
    })()

    state = 0

    wait(event: string, params: any = {}): any {
        let retryTime = 0
        while (true) {
            let connectStartTime = Date.now()
            if (typeof navigator === "object") {
                // WebView
                const mockRequest = new XMLHttpRequest()
                try {
                    mockRequest.open("POST", "http://" + this.serverAddress + "/" + event, false)
                    mockRequest.setRequestHeader("device-uuid", this.deviceUUID)
                    mockRequest.send(JSON.stringify(params))
                    if (mockRequest.status === 200) {
                        return JSON.parse(mockRequest.responseText)
                    }
                } catch (error) {
                    if (Date.now() - connectStartTime < 500 && retryTime % 100 === 0) {
                        if (confirm("连接已中断，要结束调试吗？")) {
                            break
                        }
                    }
                    else {
                        retryTime++
                    }
                }
            }
            else if (typeof XTSHttpRequest === "function") {
                // Native
                const mockRequest = new XTSHttpRequest()
                mockRequest.open("POST", "http://" + this.serverAddress + "/" + event)
                mockRequest.setRequestHeader("device-uuid", this.deviceUUID)
                mockRequest.send(JSON.stringify(params))
                if (mockRequest.status === 200) {
                    return JSON.parse(mockRequest.responseText)
                }
            }
            else {
                break
            }
        }
    }

    polling() {
        if (typeof navigator === "object") {
            const startTime = Date.now()
            const pollingRequest = new XMLHttpRequest()
            pollingRequest.open("GET", "http://" + this.serverAddress + "/events", true)
            pollingRequest.setRequestHeader("device-uuid", this.deviceUUID)
            pollingRequest.timeout = 60000
            pollingRequest.onloadend = (e) => {
                try {
                    const pollingEvents = JSON.parse(pollingRequest.responseText)
                    pollingEvents.events.forEach((it: any) => {
                        this.delegate!!.handleEvent(it.name, it.params)
                    })
                } catch (error) { }
                if (pollingRequest.status === 0 && this.state === 1 && (Date.now() - startTime) < 55000) {
                    console.log("[Tiny-Debugger] Disconnected from server " + this.serverAddress)
                    this.state = 0
                    this.delegate!!.onConnectorDisconnected()
                    this.connect()
                }
                else {
                    this.polling()
                }
            }
            pollingRequest.send()
        }
        else if (typeof XTSHttpRequest === "function") {
            // Native
            const startTime = Date.now()
            const pollingRequest = new XTSHttpRequest()
            pollingRequest.open("GET", "http://" + this.serverAddress + "/events", true)
            pollingRequest.setRequestHeader("device-uuid", this.deviceUUID)
            pollingRequest.timeout = 60000
            pollingRequest.onloadend = () => {
                try {
                    const pollingEvents = JSON.parse(pollingRequest.responseText)
                    pollingEvents.events.forEach((it: any) => {
                        this.delegate!!.handleEvent(it.name, it.params)
                    })
                } catch (error) { }
                if (pollingRequest.status === 0 && this.state === 1 && (Date.now() - startTime) < 55000) {
                    console.log("[Tiny-Debugger] Disconnected from server " + this.serverAddress)
                    this.state = 0
                    this.delegate!!.onConnectorDisconnected()
                    this.connect()
                }
                else {
                    this.polling()
                }
            }
            pollingRequest.send()
        }
    }

    connect() {
        try {
            console.log("[Tiny-Debugger] Connecting to server " + this.serverAddress)
            const obj = this.wait("connected")
            console.log(`[Tiny-Debugger] Connected to server and echo '${obj.echo}'.`)
            this.state = 1
            this.delegate!!.onConnectorConnected()
            this.polling()
        } catch (error) {
            this.state = -1
        }
    }

}

class $__Debugger {

    private connector = new $__Connector
    private connectorEventListeners: { [key: string]: (() => void)[] } = {}
    private breakpoints: { [key: string]: boolean } = {}
    private breakingNext = false

    async start() {
        this.connector.delegate = this
        await this.connector.connect()
    }

    debuggerStep() {
        this.breakingNext = true
    }

    step(uri: string, evalCallback: (script: string) => void, variables: any = {}) {
        if (this.breakpoints[uri] === true || this.breakingNext) {
            this.breakingNext = false
            this.connector.wait("paused", { uri, variables })
            while (true) {
                const resumeParams = this.connector.wait("resume")
                if (resumeParams && resumeParams.next === true) {
                    this.breakingNext = true
                    break
                }
                else if (resumeParams && typeof resumeParams.eval === "string") {
                    try {
                        evalCallback(resumeParams.eval)
                    } catch (error) {
                        console.error(error)
                    }
                }
                else {
                    break
                }
            }
        }
    }

    handleEvent(name: string, params: any) {
        if (name === "updateBreakpoints") {
            this.updateBreakpoints()
        }
        else if (name === "setBreakpoint") {
            this.setBreakpoint(params.uri)
        }
        else if (name === "removeBreakpoint") {
            this.removeBreakpoint(params.uri)
        }
        else if (name === "removeAllBreakpoints") {
            this.removeAllBreakpoints()
        }
        else if (name === "removeBreakpointsWithPrefix") {
            this.removeBreakpointsWithPrefix(params.prefix)
        }
    }

    // Breakpoints

    updateBreakpoints() {
        this.removeAllBreakpoints()
        const breakpointsData = this.connector.wait("breakpoints")
        if (breakpointsData.items instanceof Array) {
            breakpointsData.items.forEach((uri: string) => {
                this.setBreakpoint(uri)
            });
        }
    }

    setBreakpoint(uri: string) {
        this.breakpoints[uri] = true
    }

    removeBreakpoint(uri: string) {
        delete this.breakpoints[uri]
    }

    removeAllBreakpoints() {
        this.breakpoints = {}
    }

    removeBreakpointsWithPrefix(prefix: string) {
        let breakpoints: any = {}
        Object.keys(this.breakpoints).filter(it => !it.startsWith(prefix)).forEach(it => {
            breakpoints[it] = true
        })
        this.breakpoints = breakpoints
    }

    // Connector Events

    onConnectorEvent(name: string, listener: () => void) {
        if (this.connectorEventListeners[name] === undefined) {
            this.connectorEventListeners[name] = []
        }
        this.connectorEventListeners[name].push(listener)
    }

    onConnectorConnected() {
        if (this.connectorEventListeners["connected"]) {
            this.connectorEventListeners["connected"].forEach(it => it())
        }
        this.updateBreakpoints()
    }

    onConnectorDisconnected() {
        if (this.connectorEventListeners["disconnected"]) {
            this.connectorEventListeners["disconnected"].forEach(it => it())
        }
    }

}

const $debugger = new $__Debugger