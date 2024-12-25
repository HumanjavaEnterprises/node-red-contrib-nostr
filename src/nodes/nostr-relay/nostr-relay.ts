import { Node, NodeDef } from 'node-red';
import WebSocket from 'ws';
import { NostrRelayConfig } from '../nostr-relay-config/nostr-relay-config';

interface NostrFilter {
    ids?: string[];
    authors?: string[];
    kinds?: number[];
    since?: number;
    until?: number;
    limit?: number;
    [key: string]: any;
}

interface NostrRelayNodeDef extends NodeDef {
    relay: string;
    filter: string;
}

interface NostrRelayNode extends Node {
    relay: string;
    filter: NostrFilter;
    relayConfig: NostrRelayConfig;
    subscriptionId?: string;
}

module.exports = function(RED: any) {
    function NostrRelayNode(this: NostrRelayNode, config: NostrRelayNodeDef) {
        RED.nodes.createNode(this, config);
        const node = this;

        // Get the relay config node
        const relayConfig = RED.nodes.getNode(config.relay) as NostrRelayConfig;
        if (!relayConfig) {
            node.error("No relay config");
            return;
        }
        node.relayConfig = relayConfig;

        // Parse the filter
        try {
            node.filter = JSON.parse(config.filter);
        } catch (err: any) {
            node.error("Invalid filter JSON: " + err.message);
            return;
        }

        // Generate a random subscription ID
        node.subscriptionId = Math.random().toString(36).substring(2, 15);

        // Handle incoming messages
        node.on('input', function(msg: any) {
            const ws = node.relayConfig._ws;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                node.status({fill:"red", shape:"ring", text:"disconnected"});
                return;
            }

            try {
                // If the input is a Nostr event, publish it
                if (msg.payload && msg.payload.kind && msg.payload.content) {
                    const event = msg.payload;
                    ws.send(JSON.stringify(["EVENT", event]));
                    node.status({fill:"green", shape:"dot", text:"event published"});
                }
            } catch (err: any) {
                node.error("Failed to publish event: " + err.message);
                node.status({fill:"red", shape:"dot", text:"publish error"});
            }
        });

        // Subscribe to events when WebSocket connects
        const subscribe = () => {
            const ws = node.relayConfig._ws;
            if (!ws || ws.readyState !== WebSocket.OPEN) return;

            try {
                // Subscribe to events
                ws.send(JSON.stringify(["REQ", node.subscriptionId, node.filter]));
                node.status({fill:"green", shape:"dot", text:"subscribed"});

                // Handle incoming messages
                ws.on('message', (data: Buffer) => {
                    try {
                        const [type, ...params] = JSON.parse(data.toString());
                        
                        if (type === 'EVENT' && params[0] === node.subscriptionId) {
                            const event = params[1];
                            node.send({ payload: event });
                            node.status({fill:"green", shape:"dot", text:"event received"});
                        }
                    } catch (err: any) {
                        node.error("Failed to parse message: " + err.message);
                    }
                });
            } catch (err: any) {
                node.error("Failed to subscribe: " + err.message);
                node.status({fill:"red", shape:"dot", text:"subscription error"});
            }
        };

        // Subscribe when the relay connects
        if (node.relayConfig._ws) {
            node.relayConfig._ws.on('open', subscribe);
        }

        // Clean up on close
        node.on('close', (done: () => void) => {
            const ws = node.relayConfig._ws;
            if (ws && ws.readyState === WebSocket.OPEN && node.subscriptionId) {
                // Unsubscribe from events
                ws.send(JSON.stringify(["CLOSE", node.subscriptionId]));
            }
            done();
        });
    }

    RED.nodes.registerType("nostr-relay", NostrRelayNode);
};
