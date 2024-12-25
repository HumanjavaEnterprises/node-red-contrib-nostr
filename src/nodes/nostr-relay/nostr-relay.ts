import { Node, NodeAPI, NodeDef, NodeMessageInFlow, NodeConstructor } from 'node-red';
import { NostrWSClient, NostrWSMessage } from 'nostr-websocket-utils';
import { NostrRelayConfig } from '../nostr-relay-config/nostr-relay-config.js';

interface NostrRelayNodeDef extends NodeDef {
    config: string;
}

interface NostrRelayMessage extends NodeMessageInFlow {
    payload: NostrWSMessage;
}

export default function(RED: NodeAPI) {
    class NostrRelayNode {
        config: NostrRelayConfig;
        
        constructor(config: NostrRelayNodeDef) {
            // Initialize the node
            RED.nodes.createNode(this as any, config);
            
            // Get config node
            this.config = RED.nodes.getNode(config.config) as NostrRelayConfig;
            
            if (!this.config) {
                (this as any).error("No relay config");
                return;
            }

            // Set up message handler
            const handleMessage = (msg: NostrWSMessage) => {
                (this as any).send({ payload: msg });
            };

            // Add message handler to config node
            if (this.config._ws) {
                this.config._ws.on('message', handleMessage);
            }

            // Clean up on close
            (this as any).on('close', (done: () => void) => {
                // Remove message handler
                if (this.config._ws) {
                    this.config._ws.off('message', handleMessage);
                }
                done();
            });

            // Handle input messages
            (this as any).on('input', (msg: NostrRelayMessage, send: (msg: any) => void, done: (err?: Error) => void) => {
                if (this.config._ws) {
                    try {
                        this.config._ws.send(msg.payload);
                        done();
                    } catch (err) {
                        done(err as Error);
                    }
                } else {
                    done(new Error("WebSocket not connected"));
                }
            });
        }
    }

    RED.nodes.registerType("nostr-relay", NostrRelayNode as unknown as NodeConstructor<Node & NostrRelayNode, NostrRelayNodeDef, {}>);
}
