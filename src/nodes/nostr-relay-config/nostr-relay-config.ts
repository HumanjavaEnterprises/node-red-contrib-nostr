import { Node, NodeAPI, NodeDef } from 'node-red';
import { getDefaultReaderKeys, getPublicKey } from '../../crypto/keys.js';
import { Validation } from '../../utils/validation.js';

// Types only - these won't be in the JS output
import type { NostrWSClient, NostrWSMessage } from 'nostr-websocket-utils';

interface NostrRelayConfigDef extends NodeDef {
    relay: string;
    publicKey?: string;
}

interface NostrRelayConfigCredentials {
    privateKey?: string;
}

export interface NostrRelayConfig extends Node<NostrRelayConfigCredentials> {
    relay: string;
    publicKey?: string;
    privateKey?: string;
    _ws?: NostrWSClient;
}

export default function(RED: NodeAPI) {
    // Create a function to initialize the node
    async function initializeNode(this: NostrRelayConfig, config: NostrRelayConfigDef) {
        RED.nodes.createNode(this, config);

        // Validate relay URL before accepting
        if (config.relay) {
            if (!Validation.isValidRelayUrl(config.relay)) {
                this.error('Invalid relay URL: must use ws:// or wss:// protocol and be a valid URL');
                return;
            }
            this.relay = config.relay;
        } else {
            this.error('Relay URL is required');
            return;
        }

        this.publicKey = config.publicKey;
        this.privateKey = this.credentials?.privateKey;

        // Set up keys based on mode
        if (this.publicKey && this.privateKey) {
            try {
                this.publicKey = await getPublicKey(this.privateKey);
            } catch (err: any) {
                this.error("Invalid private key: " + err.message);
                return;
            }
        } else {
            // Generate ephemeral reader keys
            const readerKeys = await getDefaultReaderKeys();
            this.publicKey = readerKeys.publicKey;
            this.privateKey = readerKeys.privateKey;
        }

        try {
            // Dynamically import ESM dependency
            const { NostrWSClient } = await import('nostr-websocket-utils');

            // Initialize WebSocket connection
            this._ws = new NostrWSClient([this.relay], {
                onMessage: (data: string) => {
                    try {
                        const msg = JSON.parse(data) as NostrWSMessage;
                        this.emit('message', msg);
                    } catch (err) {
                        this.error("Failed to parse message: " + (err as Error).message);
                    }
                },
                onError: (err: Error) => {
                    this.error("WebSocket error: " + err.message);
                    this.emit('error', err);
                }
            });

            this.on('close', (done: () => void) => {
                if (this._ws) {
                    this._ws.disconnect();
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
    RED.nodes.registerType("nostr-relay-config", (function(this: NostrRelayConfig, config: NostrRelayConfigDef) {
        // Initialize asynchronously
        initializeNode.call(this, config).catch((err: any) => {
            this.error("Failed to initialize node: " + err.message);
        });
    }) as any, {
        credentials: {
            privateKey: { type: "password" }
        }
    });
}
