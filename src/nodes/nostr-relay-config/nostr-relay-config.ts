import { Node, NodeDef } from 'node-red';
import WebSocket from 'ws';
import { DEFAULT_READER_KEYS, getPublicKey } from '../../crypto/keys';

export interface NostrRelayConfigCredentials {
    privateKey?: string;
}

export interface NostrRelayConfigDef extends NodeDef {
    relay: string;
    mode: 'read-only' | 'read-write';
}

export interface NostrRelayConfig extends Node {
    relay: string;
    mode: 'read-only' | 'read-write';
    credentials: NostrRelayConfigCredentials;
    publicKey: string;
    _ws?: WebSocket;
    _reconnectTimeout?: NodeJS.Timeout;
    _pingInterval?: NodeJS.Timeout;
}

module.exports = function(RED: any) {
    function NostrRelayConfigNode(this: NostrRelayConfig, config: NostrRelayConfigDef) {
        RED.nodes.createNode(this, config);
        
        this.relay = config.relay;
        this.mode = config.mode || 'read-only';
        
        // Set up keys based on mode
        if (this.mode === 'read-write') {
            if (!this.credentials.privateKey) {
                this.error("Private key required for read-write mode");
                return;
            }
            try {
                this.publicKey = getPublicKey(this.credentials.privateKey);
            } catch (err: any) {
                this.error("Invalid private key: " + err.message);
                return;
            }
        } else {
            // Use default read-only key
            this.publicKey = DEFAULT_READER_KEYS.publicKey;
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
                this.status({fill:"green",shape:"dot",text:"connected"});
                reconnectAttempts = 0;
                
                // Start ping interval
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
                this.status({fill:"red",shape:"ring",text:"disconnected"});
                
                // Clear ping interval
                if (this._pingInterval) {
                    clearInterval(this._pingInterval);
                }
                
                // Exponential backoff for reconnection
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
                reconnectAttempts++;
                
                if (this._reconnectTimeout) {
                    clearTimeout(this._reconnectTimeout);
                }
                this._reconnectTimeout = setTimeout(connect, delay);
            });

            this._ws.on('error', (err) => {
                this.error("WebSocket error: " + err.message);
            });
        };

        // Initial connection
        connect();

        this.on('close', (done: () => void) => {
            if (this._reconnectTimeout) {
                clearTimeout(this._reconnectTimeout);
            }
            if (this._pingInterval) {
                clearInterval(this._pingInterval);
            }
            if (this._ws) {
                this._ws.close();
            }
            done();
        });
    }

    RED.nodes.registerType("nostr-relay-config", NostrRelayConfigNode, {
        credentials: {
            privateKey: {type: "password"}
        }
    });
}
