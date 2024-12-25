import { Node, NodeAPI, NodeDef } from 'node-red';
import { DEFAULT_READER_KEYS, getPublicKey } from '../../crypto/keys.js';

// Types only - these won't be in the JS output
import type { NostrWSClient, NostrWSMessage } from 'nostr-websocket-utils';

interface NostrRelayConfigDef extends NodeDef {
    relay: string;
    publicKey?: string;
    privateKey?: string;
}

export interface NostrRelayConfig extends Node {
    relay: string;
    publicKey?: string;
    privateKey?: string;
    _ws?: NostrWSClient;
}

export default function(RED: NodeAPI) {
    // Create a function to initialize the node
    async function initializeNode(this: NostrRelayConfig, config: NostrRelayConfigDef) {
        RED.nodes.createNode(this, config);
        
        this.relay = config.relay;
        this.publicKey = config.publicKey;
        this.privateKey = config.privateKey;

        // Set up keys based on mode
        if (this.publicKey && this.privateKey) {
            try {
                this.publicKey = await getPublicKey(this.privateKey);
            } catch (err: any) {
                this.error("Invalid private key: " + err.message);
                return;
            }
        } else {
            // Use default reader keys
            this.publicKey = DEFAULT_READER_KEYS.publicKey;
            this.privateKey = DEFAULT_READER_KEYS.privateKey;
        }

        try {
            // Dynamically import ESM dependency
            const { NostrWSClient } = await import('nostr-websocket-utils');

            // Initialize WebSocket connection
            this._ws = new NostrWSClient(this.relay, {
                heartbeatInterval: 30000,
                logger: {
                    debug: (...args: unknown[]) => this.debug(args.join(' ')),
                    info: (...args: unknown[]) => this.log(args.join(' ')),
                    warn: (...args: unknown[]) => this.warn(args.join(' ')),
                    error: (...args: unknown[]) => this.error(args.join(' '))
                }
            });

            this._ws.on('message', (msg: NostrWSMessage) => {
                this.emit('message', msg);
            });

            this._ws.on('error', (err: Error) => {
                this.error("WebSocket error: " + err.message);
                this.emit('error', err);
            });

            this._ws.on('close', () => {
                this.log("WebSocket closed");
                this.emit('close');
            });

            this.on('close', (done: () => void) => {
                if (this._ws) {
                    this._ws.close();
                    this._ws = undefined;
                }
                done();
            });

            // Attempt initial connection
            await this._ws.connect();
            this.log("Connected to relay: " + this.relay);
        } catch (err: any) {
            this.error("Failed to initialize node: " + err.message);
        }
    }

    // Register the node
    RED.nodes.registerType("nostr-relay-config", function(this: NostrRelayConfig, config: NostrRelayConfigDef) {
        // Initialize asynchronously
        initializeNode.call(this, config).catch((err: any) => {
            this.error("Failed to initialize node: " + err.message);
        });
    });
}
