"use strict";
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
var $__Connector = /** @class */ (function () {
    function $__Connector() {
        this.delegate = undefined;
        this.deviceUUID = (function () {
            if (typeof navigator === "object") {
                return "Browser " + Date.now();
            }
            else if (typeof UIDevice === "object") {
                return UIDevice.current.identifierForVendor;
            }
            return "";
        })();
        this.serverAddress = (function () {
            if (typeof window === "object") {
                return window.location.hostname + ":8091";
            }
            return "127.0.0.1:8091";
        })();
        this.state = 0;
    }
    $__Connector.prototype.wait = function (event, params) {
        if (params === void 0) { params = {}; }
        var retryTime = 0;
        while (true) {
            var connectStartTime = Date.now();
            if (typeof navigator === "object") {
                // WebView
                var mockRequest = new XMLHttpRequest();
                try {
                    mockRequest.open("POST", "http://" + this.serverAddress + "/" + event, false);
                    mockRequest.setRequestHeader("device-uuid", this.deviceUUID);
                    mockRequest.send(JSON.stringify(params));
                    if (mockRequest.status === 200) {
                        return JSON.parse(mockRequest.responseText);
                    }
                }
                catch (error) {
                    if (Date.now() - connectStartTime < 500 && retryTime % 100 === 0) {
                        if (confirm("连接已中断，要结束调试吗？")) {
                            break;
                        }
                    }
                    else {
                        retryTime++;
                    }
                }
            }
            else if (typeof XTSHttpRequest === "function") {
                // Native
                var mockRequest = new XTSHttpRequest();
                mockRequest.open("POST", "http://" + this.serverAddress + "/" + event);
                mockRequest.setRequestHeader("device-uuid", this.deviceUUID);
                mockRequest.send(JSON.stringify(params));
                if (mockRequest.status === 200) {
                    return JSON.parse(mockRequest.responseText);
                }
            }
            else {
                break;
            }
        }
    };
    $__Connector.prototype.polling = function () {
        var _this = this;
        if (typeof navigator === "object") {
            var startTime_1 = Date.now();
            var pollingRequest_1 = new XMLHttpRequest();
            pollingRequest_1.open("GET", "http://" + this.serverAddress + "/events", true);
            pollingRequest_1.setRequestHeader("device-uuid", this.deviceUUID);
            pollingRequest_1.timeout = 60000;
            pollingRequest_1.onloadend = function (e) {
                try {
                    var pollingEvents = JSON.parse(pollingRequest_1.responseText);
                    pollingEvents.events.forEach(function (it) {
                        _this.delegate.handleEvent(it.name, it.params);
                    });
                }
                catch (error) { }
                if (pollingRequest_1.status === 0 && _this.state === 1 && (Date.now() - startTime_1) < 55000) {
                    console.log("[Tiny-Debugger] Disconnected from server " + _this.serverAddress);
                    _this.state = 0;
                    _this.delegate.onConnectorDisconnected();
                    _this.connect();
                }
                else {
                    _this.polling();
                }
            };
            pollingRequest_1.send();
        }
        else if (typeof XTSHttpRequest === "function") {
            // Native
            var startTime_2 = Date.now();
            var pollingRequest_2 = new XTSHttpRequest();
            pollingRequest_2.open("GET", "http://" + this.serverAddress + "/events", true);
            pollingRequest_2.setRequestHeader("device-uuid", this.deviceUUID);
            pollingRequest_2.timeout = 60000;
            pollingRequest_2.onloadend = function () {
                try {
                    var pollingEvents = JSON.parse(pollingRequest_2.responseText);
                    pollingEvents.events.forEach(function (it) {
                        _this.delegate.handleEvent(it.name, it.params);
                    });
                }
                catch (error) { }
                if (pollingRequest_2.status === 0 && _this.state === 1 && (Date.now() - startTime_2) < 55000) {
                    console.log("[Tiny-Debugger] Disconnected from server " + _this.serverAddress);
                    _this.state = 0;
                    _this.delegate.onConnectorDisconnected();
                    _this.connect();
                }
                else {
                    _this.polling();
                }
            };
            pollingRequest_2.send();
        }
    };
    $__Connector.prototype.connect = function () {
        try {
            console.log("[Tiny-Debugger] Connecting to server " + this.serverAddress);
            var obj = this.wait("connected");
            console.log("[Tiny-Debugger] Connected to server and echo '" + obj.echo + "'.");
            this.state = 1;
            this.delegate.onConnectorConnected();
            this.polling();
        }
        catch (error) {
            this.state = -1;
        }
    };
    return $__Connector;
}());
var $__Debugger = /** @class */ (function () {
    function $__Debugger() {
        this.connector = new $__Connector;
        this.connectorEventListeners = {};
        this.breakpoints = {};
        this.breakingNext = false;
    }
    $__Debugger.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.connector.delegate = this;
                        return [4 /*yield*/, this.connector.connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    $__Debugger.prototype.debuggerStep = function () {
        this.breakingNext = true;
    };
    $__Debugger.prototype.step = function (uri, evalCallback, variables) {
        if (variables === void 0) { variables = {}; }
        if (this.breakpoints[uri] === true || this.breakingNext) {
            this.breakingNext = false;
            this.connector.wait("paused", { uri: uri, variables: variables });
            while (true) {
                var resumeParams = this.connector.wait("resume");
                if (resumeParams && resumeParams.next === true) {
                    this.breakingNext = true;
                    break;
                }
                else if (resumeParams && typeof resumeParams.eval === "string") {
                    try {
                        evalCallback(resumeParams.eval);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
                else {
                    break;
                }
            }
        }
    };
    $__Debugger.prototype.handleEvent = function (name, params) {
        if (name === "updateBreakpoints") {
            this.updateBreakpoints();
        }
        else if (name === "setBreakpoint") {
            this.setBreakpoint(params.uri);
        }
        else if (name === "removeBreakpoint") {
            this.removeBreakpoint(params.uri);
        }
        else if (name === "removeAllBreakpoints") {
            this.removeAllBreakpoints();
        }
        else if (name === "removeBreakpointsWithPrefix") {
            this.removeBreakpointsWithPrefix(params.prefix);
        }
    };
    // Breakpoints
    $__Debugger.prototype.updateBreakpoints = function () {
        var _this = this;
        this.removeAllBreakpoints();
        var breakpointsData = this.connector.wait("breakpoints");
        if (breakpointsData.items instanceof Array) {
            breakpointsData.items.forEach(function (uri) {
                _this.setBreakpoint(uri);
            });
        }
    };
    $__Debugger.prototype.setBreakpoint = function (uri) {
        this.breakpoints[uri] = true;
    };
    $__Debugger.prototype.removeBreakpoint = function (uri) {
        delete this.breakpoints[uri];
    };
    $__Debugger.prototype.removeAllBreakpoints = function () {
        this.breakpoints = {};
    };
    $__Debugger.prototype.removeBreakpointsWithPrefix = function (prefix) {
        var breakpoints = {};
        Object.keys(this.breakpoints).filter(function (it) { return !it.startsWith(prefix); }).forEach(function (it) {
            breakpoints[it] = true;
        });
        this.breakpoints = breakpoints;
    };
    // Connector Events
    $__Debugger.prototype.onConnectorEvent = function (name, listener) {
        if (this.connectorEventListeners[name] === undefined) {
            this.connectorEventListeners[name] = [];
        }
        this.connectorEventListeners[name].push(listener);
    };
    $__Debugger.prototype.onConnectorConnected = function () {
        if (this.connectorEventListeners["connected"]) {
            this.connectorEventListeners["connected"].forEach(function (it) { return it(); });
        }
        this.updateBreakpoints();
    };
    $__Debugger.prototype.onConnectorDisconnected = function () {
        if (this.connectorEventListeners["disconnected"]) {
            this.connectorEventListeners["disconnected"].forEach(function (it) { return it(); });
        }
    };
    return $__Debugger;
}());
var $debugger = new $__Debugger;
