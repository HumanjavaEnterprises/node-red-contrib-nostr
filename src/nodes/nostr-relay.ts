import { Node, NodeAPI, NodeDef } from 'node-red';
import WebSocket from 'ws';

interface NostrRelayDef extends NodeDef {
    relayUrl: string;
}

interface NostrRelayNode extends Node {
    relayUrl: string;
    ws?: WebSocket;
}

class WebSocketManager {
    private ws?: WebSocket;
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
        this.ws = new WebSocket(this.url);
        
        this.ws.on('open', () => {
            this.onConnect();
        });

        this.ws.on('close', () => {
            this.onDisconnect();
        });

        this.ws.on('error', (error) => {
            this.onError(error);
        });
    }

    async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
        }
    }
}

module.exports = function(RED: NodeAPI) {
    function NostrRelayNode(this: NostrRelayNode, config: NostrRelayDef) {
        RED.nodes.createNode(this, config);
        
        // Initialize properties
        this.relayUrl = config.relayUrl;
        
        // Create WebSocket manager
        const wsManager = new WebSocketManager({
            relayUrl: this.relayUrl,
            onConnect: () => {
                this.status({fill: "green", shape: "dot", text: "connected"});
            },
            onDisconnect: () => {
                this.status({fill: "red", shape: "ring", text: "disconnected"});
            },
            onError: (error: Error) => {
                this.error(`Relay error: ${error.message}`);
            }
        });

        // Connect on node start
        wsManager.connect();

        // Handle incoming messages
        this.on('input', async (msg: any, send: (msg: any) => void, done: (err?: Error) => void) => {
            try {
                // Handle the message
                // ... implementation here
                
                send(msg);
                done();
            } catch (error) {
                done(error instanceof Error ? error : new Error('Unknown error'));
            }
        });

        // Cleanup on close
        this.on('close', async (done: () => void) => {
            await wsManager.disconnect();
            done();
        });
    }

    RED.nodes.registerType("nostr-relay", NostrRelayNode as unknown as any);
}
