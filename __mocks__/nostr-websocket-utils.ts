import { EventEmitter } from 'events';
import { vi } from 'vitest';

export class NostrWSClient extends EventEmitter {
    private url: string;
    private options: any;
    private _connected: boolean = false;
    public on: any;
    public subscribe: any;
    public send: any;

    constructor(url: string, options: any = {}) {
        super();
        this.url = url;
        this.options = options;

        // Create spy functions with implementations
        this.on = vi.fn().mockImplementation((event: string, callback: (...args: any[]) => void) => {
            super.on(event, callback);
            return this;
        });

        this.subscribe = vi.fn().mockImplementation((subId: string, filter: any) => {
            // Emit a test event that matches the filter
            setTimeout(() => {
                this.emit('message', {
                    type: 'EVENT',
                    subscriptionId: subId,
                    event: {
                        kind: filter.kinds?.[0] || 1,
                        content: 'test content',
                        tags: [],
                        pubkey: filter.authors?.[0] || 'test-pubkey',
                        id: 'test-id',
                        sig: 'test-sig',
                        created_at: Math.floor(Date.now() / 1000)
                    }
                });
            }, 0);
            return this;
        });

        this.send = vi.fn().mockImplementation((data: any) => {
            if (data.type === 'EVENT') {
                setTimeout(() => {
                    this.emit('message', data);
                }, 0);
            }
            return this;
        });
    }

    async connect(): Promise<void> {
        this._connected = true;
        setTimeout(() => {
            this.emit('open');
        }, 0);
    }

    close(): void {
        this._connected = false;
        this.emit('close');
    }

    publish(event: any): void {
        this.send({ type: 'EVENT', event });
    }

    setOptions(options: any) {
        this.options = options;
        return this;
    }

    // Helper methods for testing
    mockReceiveMessage(msg: any): void {
        this.emit('message', msg);
    }

    mockError(error: Error): void {
        this._connected = false;
        this.emit('error', error);
        if (this.options?.node?.error) {
            this.options.node.error('WebSocket error:', error);
        }
    }

    isConnected(): boolean {
        return this._connected;
    }
}

// Export as both named and default export
export default { NostrWSClient };
