/** Broadcast Channel for executing functions between different window contexts */
export default class FunctionBroadcastChannel {
    /** Broadcast channel object */
    private _broadcastChannel: BroadcastChannel | null = null;
    /** Executable functions by the broadcast channel */
    private _functions: Record<string, MessageFunction> = {};
    /** Callbacks store */
    private _callbacks: Record<string, Function> = {};

    id: string;

    get initialized() {
        return this._broadcastChannel != null;
    }

    constructor(options: {
        id: string,
        skipInit?: boolean,
        functions?: Record<string, MessageFunction>
    }) {
        this.id = options.id;
        if (options.functions) {
            this._functions = options.functions;
        }
        if (!options.skipInit) {
            this.init();
        }
    }

    /** Initializes the broadcast channel */
    init() {
        if (this._broadcastChannel == null) {
            this._broadcastChannel = new BroadcastChannel(this.id);
            this._broadcastChannel.onmessage = this._onMessage.bind(this);
        } else {
            console.warn('BroadcastChannel already initialized')
        }
    }

    /** Closes the broadcast channel */
    close() {
        if (this._broadcastChannel) {
            this._broadcastChannel.close();
            this._broadcastChannel = null;
        } else {
            console.warn('BroadcastChannel already closed');
        }
    }

    /**
     * Will broadcast function execution on the channel
     * @param {string} name Name of the function to execute on the receiver
     * @param {string} argument Optional argument that will be passed to the executed function, must be string type
     * @param {number} timeout The timeout after which the promise will reject if no response is received
     */
    async execute(name: string, argument?: string, timeout: number = 10000) {
        if (this._broadcastChannel != null) {
            const uid = crypto.randomUUID();
            const messageObject: FunctionBroadcastMessage = {
                operation: 'execute',
                name: name,
                payload: argument,
                meta: {
                    uid: uid
                }
            };
            let promiseRes: Function;
            let promiseRej: Function;
            const promise = new Promise<any>((res, rej) => {
                promiseRes = res;
                promiseRej = rej;
            });
            const timeoutDebounce = window.setTimeout(() => {
                delete this._callbacks[uid];
                promiseRej(new Error('Broadcast Channel timeout'));
            }, timeout);
            this._callbacks[uid] = (success?: boolean, result?: string) => {
                window.clearTimeout(timeoutDebounce);
                delete this._callbacks[uid];
                if (!success) {
                    promiseRej(new Error(result ?? 'Recieved failed status'));
                } else {
                    promiseRes(result);
                }
            };
            this._broadcastChannel.postMessage(JSON.stringify(messageObject));
            return promise;
        }
    }

    /**
     * Adds function as an executable for the broadcast channel in the current context
     * @param {string} name Name of the function
     * @param {Function} fn Function that will be executed
     */
    registerFunction(name: string, fn: MessageFunction) {
        this._functions[name] = fn;
    }

    private async _onMessage(e: MessageEvent) {
        const message = e.data;
        if (!message) {
            console.warn('Received empty broadcast message', message);
            return;
        }
        const messageObject = JSON.parse(message) as FunctionBroadcastMessage;
        switch (messageObject.operation) {
            case 'execute':
                if (messageObject.name && typeof this._functions[messageObject.name] === 'function') {
                    // @ts-ignore
                    const result = await this._functions[messageObject.name](messageObject.payload);
                    const responseObject = {
                        operation: 'callback',
                        payload: result,
                        success: true,
                        meta: {
                            uid: messageObject.meta.uid,
                            broadcaster: window.location.href
                        }
                    } as FunctionBroadcastMessage;
                    this._broadcastChannel?.postMessage(JSON.stringify(responseObject));
                } else {
                    const result = `Could not execute function with name: ${messageObject.name}`;
                    console.warn(result);
                    const responseObject = {
                        operation: 'callback',
                        payload: result,
                        success: false,
                        meta: {
                            uid: messageObject.meta.uid,
                            broadcaster: window.location.href
                        }
                    } as FunctionBroadcastMessage;
                    this._broadcastChannel?.postMessage(JSON.stringify(responseObject));
                }
                break;
            case 'callback':
                const uid = messageObject.meta.uid;
                const callback = this._callbacks[uid];
                if (typeof callback === 'function') {
                    callback(messageObject.success, messageObject.payload);
                }
                break;
        }
    }
}

export type MessageFunction = (value?: string, broadcaster?: URL) => Promise<string | undefined>;

export interface FunctionBroadcastMessage {
    operation: 'execute' | 'callback'
    name?: string,
    payload?: string,
    success?: boolean,
    meta: {
        uid: string
    }
}
