import { Node, NodeDef } from 'node-red';
import WebSocket from 'ws';
import * as crypto from 'crypto';

export interface NostrRelayConfigCredentials {
    privateKey?: string;
}

export interface NostrRelayConfigDef extends NodeDef {
    relay: string;
}

export interface NostrRelayConfig extends Node {
    relay: string;
    credentials: NostrRelayConfigCredentials;
    publicKey?: string;
    _ws?: WebSocket;
    _reconnectTimeout?: NodeJS.Timeout;
    _pingInterval?: NodeJS.Timeout;
}

module.exports = function(RED: any) {
    function NostrRelayConfigNode(this: NostrRelayConfig, config: NostrRelayConfigDef) {
        RED.nodes.createNode(this, config);
        
        this.relay = config.relay;
        
        // If we have a private key, derive the public key
        if (this.credentials.privateKey) {
            try {
                // For now, just store a hash of the private key as the public key
                // In production, we would use proper key derivation
                this.publicKey = crypto.createHash('sha256')
                    .update(this.credentials.privateKey)
                    .digest('hex');
            } catch (err: any) {
                this.error("Invalid private key: " + err.message);
            }
        }

        // Initialize WebSocket connection
        let reconnectAttempts = 0;
        const MAX_RECONNECT_DELAY = 300000; // 5 minutes

        const connect = () => {
            if (this._ws) {
                this._ws.close();
            }

            this._ws = new WebSocket(this.relay);
            
            this._ws.on('open', () => {
                this.log(`Connected to ${this.relay}`);
                reconnectAttempts = 0;
                
                // Setup ping interval
                if (this._pingInterval) {
                    clearInterval(this._pingInterval);
                }
                this._pingInterval = setInterval(() => {
                    if (this._ws?.readyState === WebSocket.OPEN) {
                        this._ws.ping();
                    }
                }, 30000);
            });

            this._ws.on('close', () => {
                this.log(`Disconnected from ${this.relay}`);
                // Exponential backoff for reconnection
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
                reconnectAttempts++;
                
                if (this._reconnectTimeout) {
                    clearTimeout(this._reconnectTimeout);
                }
                this._reconnectTimeout = setTimeout(connect, delay);
            });

            this._ws.on('error', (err: Error) => {
                this.error(`WebSocket error: ${err.message}`);
            });
        };

        // Initial connection
        connect();

        // Cleanup on node removal
        this.on('close', (done: () => void) => {
            if (this._pingInterval) {
                clearInterval(this._pingInterval);
            }
            if (this._reconnectTimeout) {
                clearTimeout(this._reconnectTimeout);
            }
            if (this._ws) {
                this._ws.close();
            }
            done();
        });
    }

    RED.nodes.registerType("nostr-relay-config", NostrRelayConfigNode, {
        credentials: {
            privateKey: { type: "password" }
        }
    });
};
