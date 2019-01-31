"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var events_1 = require("events");
var ClientEvent = /** @class */ (function () {
    function ClientEvent(name, params) {
        this.name = name;
        this.params = params;
    }
    return ClientEvent;
}());
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client(uuid) {
        var _this = _super.call(this) || this;
        _this.uuid = uuid;
        _this.sendingEvents = [];
        return _this;
    }
    Client.prototype.emitToClient = function (name, params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        this.sendingEvents.push(new ClientEvent(name, params));
        if (this.sendingTimer === undefined) {
            this.sendingTimer = setTimeout(function () {
                _this.emit("events");
                _this.sendingTimer = undefined;
            }, 100);
        }
    };
    return Client;
}(events_1.EventEmitter));
var TinyDebugger = /** @class */ (function (_super) {
    __extends(TinyDebugger, _super);
    function TinyDebugger() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.clients = [];
        _this.breakpoints = [];
        return _this;
    }
    TinyDebugger.prototype.createServer = function (port) {
        var _this = this;
        if (port === void 0) { port = 8091; }
        http.createServer(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, error_1;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.setHeader("Access-Control-Allow-Methods", "GET,POST");
                        res.setHeader("Access-Control-Allow-Headers", "device-uuid");
                        res.setHeader("Access-Control-Max-Age", 86000);
                        if (req.method === "OPTIONS") {
                            return [2 /*return*/, this.resolve(res)];
                        }
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 11, , 12]);
                        if (!(req.url === "/events")) return [3 /*break*/, 3];
                        _a = this.resolve;
                        _b = [res];
                        return [4 /*yield*/, this.events(req, res)];
                    case 2:
                        _a.apply(this, _b.concat([_j.sent()]));
                        return [2 /*return*/];
                    case 3:
                        if (!(req.url === "/connected")) return [3 /*break*/, 5];
                        _c = this.resolve;
                        _d = [res];
                        return [4 /*yield*/, this.connected(req, res)];
                    case 4:
                        _c.apply(this, _d.concat([_j.sent()]));
                        return [2 /*return*/];
                    case 5:
                        if (!(req.url === "/paused")) return [3 /*break*/, 7];
                        _e = this.resolve;
                        _f = [res];
                        return [4 /*yield*/, this.paused(req, res)];
                    case 6:
                        _e.apply(this, _f.concat([_j.sent()]));
                        return [2 /*return*/];
                    case 7:
                        if (!(req.url === "/breakpoints")) return [3 /*break*/, 8];
                        this.resolve(res, { items: this.breakpoints });
                        return [2 /*return*/];
                    case 8:
                        if (!req.url) return [3 /*break*/, 10];
                        _g = this.resolve;
                        _h = [res];
                        return [4 /*yield*/, this.customEvent(req, res)];
                    case 9:
                        _g.apply(this, _h.concat([_j.sent()]));
                        return [2 /*return*/];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_1 = _j.sent();
                        this.reject(res, error_1);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        }); }).listen(port);
    };
    // Breakpoint Handlers
    TinyDebugger.prototype.setBreakpoints = function (bps) {
        var _this = this;
        bps.forEach(function (it) {
            _this.breakpoints.push(it);
        });
        this.clients.forEach(function (it) {
            it.emitToClient("setBreakpoints", { bps: bps });
        });
    };
    TinyDebugger.prototype.setBreakpoint = function (uri) {
        if (this.breakpoints.indexOf(uri) < 0) {
            this.breakpoints.push(uri);
            this.clients.forEach(function (it) {
                it.emitToClient("setBreakpoint", { uri: uri });
            });
        }
    };
    TinyDebugger.prototype.removeBreakpoint = function (uri) {
        var idx = this.breakpoints.indexOf(uri);
        if (idx >= 0) {
            this.breakpoints.splice(idx, 1);
        }
        this.clients.forEach(function (it) {
            it.emitToClient("removeBreakpoint", { uri: uri });
        });
    };
    TinyDebugger.prototype.removeAllBreakpoints = function () {
        this.breakpoints = [];
        this.clients.forEach(function (it) {
            it.emitToClient("removeAllBreakpoints");
        });
    };
    TinyDebugger.prototype.removeBreakpointsWithPrefix = function (prefix) {
        this.breakpoints = this.breakpoints.filter(function (it) { return !it.startsWith(prefix); });
        this.clients.forEach(function (it) {
            it.emitToClient("removeBreakpointsWithPrefix", { prefix: prefix });
        });
    };
    // Client Event Handlers
    TinyDebugger.prototype.events = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var client, events;
            return __generator(this, function (_a) {
                client = this.clientWithRequest(req);
                if (client) {
                    if (client.sendingEvents.length > 0) {
                        events = client.sendingEvents;
                        client.sendingEvents = [];
                        return [2 /*return*/, { events: events }];
                    }
                    return [2 /*return*/, new Promise(function (resolver) {
                            client.once("events", function () {
                                var events = client.sendingEvents;
                                client.sendingEvents = [];
                                resolver({ events: events });
                            });
                        })];
                }
                else {
                    throw Error("device not found.");
                }
                return [2 /*return*/];
            });
        });
    };
    TinyDebugger.prototype.connected = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var deviceUUID, client;
            return __generator(this, function (_a) {
                deviceUUID = req.headers["device-uuid"];
                if (typeof deviceUUID === "string") {
                    this.clients = this.clients.filter(function (it) { return it.uuid !== deviceUUID; });
                    client = new Client(deviceUUID);
                    this.clients.push(client);
                    this.emit("client.connected", client);
                    return [2 /*return*/, { echo: "Hello, World!" }];
                }
                else {
                    throw Error("device-uuid required.");
                }
                return [2 /*return*/];
            });
        });
    };
    TinyDebugger.prototype.paused = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var client, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.clientWithRequest(req);
                        if (!client) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.paramsFromRequest(req)];
                    case 1:
                        params = _a.sent();
                        this.emit("client.paused", client, params);
                        return [2 /*return*/, { result: "done" }];
                    case 2: throw Error("device not found.");
                }
            });
        });
    };
    TinyDebugger.prototype.customEvent = function (req, res) {
        var client = this.clientWithRequest(req);
        var event = req.url ? req.url.replace("/", "") : undefined;
        if (client && event && event.length > 0) {
            return new Promise(function (resolver) {
                client.once(event, function (params) {
                    resolver(params);
                });
            });
        }
        else {
            throw Error("device-uuid and event required.");
        }
    };
    TinyDebugger.prototype.clientWithRequest = function (req) {
        var deviceUUID = req.headers["device-uuid"];
        if (typeof deviceUUID === "string") {
            return this.clients.filter(function (it) { return it.uuid === deviceUUID; })[0];
        }
        else {
            return undefined;
        }
    };
    TinyDebugger.prototype.paramsFromRequest = function (req) {
        return new Promise(function (resolver, rejector) {
            var body = [];
            req.on('error', function (err) {
                rejector(err);
            }).on('data', function (chunk) {
                body.push(chunk);
            }).on('end', function () {
                try {
                    resolver(JSON.parse(Buffer.concat(body).toString()));
                }
                catch (error) {
                    resolver({});
                }
            });
        });
    };
    TinyDebugger.prototype.resolve = function (res, message) {
        if (message === void 0) { message = {}; }
        res.statusCode = 200;
        res.write(JSON.stringify(message));
        res.end();
    };
    TinyDebugger.prototype.reject = function (res, error) {
        res.statusCode = 400;
        res.write(JSON.stringify({ error: error.message }));
        res.end();
    };
    return TinyDebugger;
}(events_1.EventEmitter));
exports.TinyDebugger = TinyDebugger;
