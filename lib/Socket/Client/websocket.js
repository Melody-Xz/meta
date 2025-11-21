"use strict";

const ws_1 = __importDefault(require("ws"));
const Defaults_1 = require("../../Defaults");
const types_1 = require("./types");

class WebSocketClient extends types_1.AbstractSocketClient {
    constructor() {
        super(...arguments);
        this.socket = null;
        this._queue = [];
        this._isDispatching = false;
        this._lastDispatch = 0;
        this._minSendIntervalMs = (Defaults_1.DEFAULT_CONNECTION_CONFIG?.minSendIntervalMs) || 50;
    }

    get isOpen() {
        return this.socket?.readyState === ws_1.default.OPEN;
    }

    get isClosed() {
        return this.socket === null || this.socket?.readyState === ws_1.default.CLOSED;
    }

    get isClosing() {
        return this.socket === null || this.socket?.readyState === ws_1.default.CLOSING;
    }

    get isConnecting() {
        return this.socket?.readyState === ws_1.default.CONNECTING;
    }

    async connect() {
        if (this.socket) {
            return;
        }

        this.socket = new ws_1.default(this.url, {
            origin: Defaults_1.DEFAULT_ORIGIN,
            headers: this.config.options?.headers,
            handshakeTimeout: this.config.connectTimeoutMs,
            timeout: this.config.connectTimeoutMs,
            agent: this.config.agent,
        });

        this.socket.setMaxListeners(0);

        const events = ['close', 'error', 'upgrade', 'message', 'open', 'ping', 'pong', 'unexpected-response'];
        for (const event of events) {
            this.socket?.on(event, (...args) => this.emit(event, ...args));
        }
    }

    async close() {
        if (!this.socket) {
            return;
        }
        this.socket.close();
        this.socket = null;
    }

    async restart() {
        if (this.socket) {
            await new Promise(resolve => {
                this.socket.once('close', resolve);
                this.socket.terminate();
            });
            this.socket = null;
        }
        await this.connect();
    }

    send(str, cb) {
        const doSend = () => {
            this.socket?.send(str, cb);
            return Boolean(this.socket);
        };

        this._queue.push(doSend);
        this._dispatch();
        return true;
    }

    _dispatch() {
        if (this._isDispatching) {
            return;
        }

        this._isDispatching = true;

        const tick = () => {
            const now = Date.now();
            if (this._queue.length === 0) {
                this._isDispatching = false;
                return;
            }

            const delta = now - this._lastDispatch;
            const wait = Math.max(0, this._minSendIntervalMs - delta);

            setTimeout(() => {
                const fn = this._queue.shift();
                this._lastDispatch = Date.now();
                try {
                    fn?.();
                } catch {
                    // ignore send errors
                }
                tick();
            }, wait);
        };

        tick();
    }
}

exports.WebSocketClient = WebSocketClient;