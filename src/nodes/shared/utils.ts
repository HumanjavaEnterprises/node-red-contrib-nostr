import WebSocket from 'ws';
import { NostrEvent, NostrFilter } from './types';

export class NostrWebSocket extends WebSocket {
    private subscriptionId: string;
    private filter: object;
    private onEvent: (event: NostrEvent) => void;
    private onError: (error: Error) => void;

    constructor(
        url: string,
        subscriptionId: string,
        filter: object,
        onEvent: (event: NostrEvent) => void,
        onError: (error: Error) => void
    ) {
        super(url);
        this.subscriptionId = subscriptionId;
        this.filter = filter;
        this.onEvent = onEvent;
        this.onError = onError;

        this.on('open', () => {
            this.send(JSON.stringify(['REQ', this.subscriptionId, this.filter]));
        });

        this.on('error', (error: Error) => {
            this.onError(error);
        });

        this.on('message', (data: WebSocket.Data) => {
            try {
                const message = JSON.parse(data.toString());
                if (Array.isArray(message) && message[0] === 'EVENT' && message[2]) {
                    this.onEvent(message[2]);
                }
            } catch (err) {
                if (err instanceof Error) {
                    this.onError(err);
                } else {
                    this.onError(new Error('Unknown error occurred'));
                }
            }
        });
    }

    close() {
        this.send(JSON.stringify(['CLOSE', this.subscriptionId]));
        super.close();
    }
}

export class WebSocketManager {
    private ws?: NostrWebSocket;
    private url: string;
    private onConnect: () => void;
    private onDisconnect: () => void;
    private onError: (error: Error) => void;

    constructor(config: {
        relayUrl: string;
        onConnect: () => void;
        onDisconnect: () => void;
        onError: (error: Error) => void;
    }) {
        this.url = config.relayUrl;
        this.onConnect = config.onConnect;
        this.onDisconnect = config.onDisconnect;
        this.onError = config.onError;
    }

    connect(): void {
        this.ws = new NostrWebSocket(this.url, '', {}, () => {}, this.onError);
        
        this.ws.on('open', () => {
            this.onConnect();
        });

        this.ws.on('close', () => {
            this.onDisconnect();
        });
    }

    async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
        }
    }

    async sendEvent(event: NostrEvent): Promise<void> {
        if (!this.ws) {
            throw new Error('WebSocket not connected');
        }
        this.ws.send(JSON.stringify(['EVENT', event]));
    }

    async subscribe(filters: NostrFilter[]): Promise<string> {
        if (!this.ws) {
            throw new Error('WebSocket not connected');
        }
        const subscriptionId = Math.random().toString(36).substring(2);
        this.ws = new NostrWebSocket(this.url, subscriptionId, filters, (event) => this.sendEvent(event), this.onError);
        return subscriptionId;
    }

    async unsubscribe(subscriptionId: string): Promise<void> {
        if (!this.ws) {
            throw new Error('WebSocket not connected');
        }
        this.ws.close();
    }
}
