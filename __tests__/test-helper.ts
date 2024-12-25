import { NodeAPI } from 'node-red';
import { vi } from 'vitest';
import { NostrWSClient } from '../__mocks__/nostr-websocket-utils';

export function createTestNode() {
    const node: any = {
        id: 'test-node',
        type: 'test-type',
        name: 'test-name',
        _closeCallbacks: [],
        credentials: {},
        status: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        log: vi.fn(),
        on: vi.fn((event: string, callback: Function) => {
            if (event === 'close') {
                node._closeCallbacks.push(callback);
            }
        }),
        emit: vi.fn(),
        send: vi.fn(),
        done: vi.fn(),
        context: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn()
        })),
        close: () => {
            node._closeCallbacks.forEach((cb: Function) => cb());
        }
    };
    return node;
}

export function createTestRelayConfig() {
    const ws = new NostrWSClient('wss://test.relay.com');
    
    // Create the node first
    const node = {
        id: 'test-relay-config',
        type: 'nostr-relay-config',
        relay: 'wss://test.relay.com',
        _ws: ws,
        on: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        log: vi.fn(),
        credentials: {},
        close: vi.fn(() => {
            ws.close();
        })
    };

    // Pass the node to the WebSocket client for logging
    ws.setOptions({ node });
    
    // Connect immediately for testing
    ws.connect();

    return node;
}

export function createTestFilter() {
    const relayConfig = createTestRelayConfig();
    const node = createTestNode();
    node.id = 'test-filter';
    node.type = 'nostr-filter';
    node.filterType = 'kind';
    node.kind = 1;
    node._ws = relayConfig._ws;

    // Add message handler
    node._ws.on('message', (msg: any) => {
        if (!node.relay) {
            node.error('No relay config node');
            return;
        }
        if (msg.type === 'EVENT') {
            const event = msg.event;
            if (node.filterType === 'kind' && event.kind === node.kind) {
                node.send({ payload: event });
            } else if (node.filterType === 'tag' && event.tags.some((tag: string[]) => 
                tag[0] === node.tagName && tag[1] === node.tagValue)) {
                node.send({ payload: event });
            }
        }
    });

    // Define a custom setter for relay
    Object.defineProperty(node, 'relay', {
        get() {
            return this._relay;
        },
        set(value) {
            this._relay = value;
            if (!value) {
                this.error('No relay config node');
            }
        }
    });

    // Set initial value
    node.relay = relayConfig;

    return node;
}

export function createTestNpubFilter() {
    const relayConfig = createTestRelayConfig();
    const node = createTestNode();
    node.id = 'test-npub-filter';
    node.type = 'nostr-npub-filter';
    node.npub = 'npub1valid';
    node.hexPubkey = 'hex-pubkey';
    node._ws = relayConfig._ws;

    // Add message handler
    node._ws.on('message', (msg: any) => {
        if (!node.relay) {
            node.error('No relay config node');
            return;
        }
        if (msg.type === 'EVENT') {
            const event = msg.event;
            if (event.pubkey === node.hexPubkey) {
                node.send({ payload: event });
            }
        }
    });

    // Define a custom setter for relay
    Object.defineProperty(node, 'relay', {
        get() {
            return this._relay;
        },
        set(value) {
            this._relay = value;
            if (!value) {
                this.error('No relay config node');
            }
        }
    });

    // Set initial value
    node.relay = relayConfig;

    return node;
}

export function createTestRED(): NodeAPI {
    const relayConfig = createTestRelayConfig();
    const filterNode = createTestFilter();
    const npubFilterNode = createTestNpubFilter();

    const nodes: { [key: string]: any } = {
        'test-relay-config': relayConfig,
        'test-filter': filterNode,
        'test-npub-filter': npubFilterNode
    };

    return {
        nodes: {
            createNode: vi.fn((node: any, config: any) => {
                Object.assign(node, config);
                node.error = vi.fn();
                node.warn = vi.fn();
                node.debug = vi.fn();
                node.trace = vi.fn();
                node.log = vi.fn();
                node.status = vi.fn();
                node.send = vi.fn();
                node.on = vi.fn((event: string, callback: Function) => {
                    if (event === 'close') {
                        node._closeCallbacks = node._closeCallbacks || [];
                        node._closeCallbacks.push(callback);
                    }
                });
            }),
            registerType: vi.fn(),
            getNode: vi.fn((id: string) => nodes[id] || null)
        },
        _: vi.fn((key: string) => key),
        log: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            trace: vi.fn()
        }
    } as unknown as NodeAPI;
}

export function createMockEvent(kind: number = 1, content: string = 'test', pubkey: string = 'test-pubkey') {
    return {
        type: 'EVENT',
        event: {
            id: 'test-event-id',
            pubkey,
            created_at: Math.floor(Date.now() / 1000),
            kind,
            tags: [],
            content,
            sig: 'test-signature'
        }
    };
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
