import { Node, NodeAPI, NodeDef } from 'node-red';
import { NostrEvent } from '../../nodes/shared/types';
import { NostrRelayConfig } from '../nostr-relay-config/nostr-relay-config.js';


interface NostrNpubFilterDef extends NodeDef {
    relay: string;  // ID of the relay config node
    npubValue: string;
    eventKinds: number[];
}

interface NostrNpubFilterNode extends Node {
    relay: NostrRelayConfig;
    npubValue: string;
    eventKinds: number[];
    hexPubkey?: string;
}

export default function(RED: NodeAPI) {
    // Create a function to initialize the node
    async function initializeNode(this: NostrNpubFilterNode, config: NostrNpubFilterDef) {
        RED.nodes.createNode(this, config);

        // Get the relay configuration node
        this.relay = RED.nodes.getNode(config.relay) as NostrRelayConfig;
        if (!this.relay) {
            this.error("No relay configuration found");
            this.status({ fill: "red", shape: "ring", text: "Missing relay config" });
            return;
        }

        this.npubValue = config.npubValue;
        this.eventKinds = config.eventKinds || [0, 1]; // Default to metadata and text notes

        try {
            // Dynamically import ESM dependencies
            const { nip19 } = await import('nostr-tools');

            // Convert npub to hex if needed
            if (this.npubValue) {
                try {
                    const decoded = nip19.decode(this.npubValue);
                    if (decoded.type === 'npub') {
                        this.hexPubkey = decoded.data;
                        this.status({ fill: "green", shape: "dot", text: "Ready" });
                    } else {
                        throw new Error("Invalid npub format");
                    }
                } catch (err: any) {
                    this.error("Invalid npub: " + err.message);
                    this.status({ fill: "red", shape: "dot", text: "Invalid npub" });
                    return;
                }
            }

            // Set up message handler on the config node's event emitter
            (this.relay as any).on('message', (msg: any) => {
                if (msg.type === 'EVENT' && msg.event) {
                    const event = msg.event as NostrEvent;

                    // Check if event matches our filter criteria
                    if (this.hexPubkey && 
                        event.pubkey === this.hexPubkey && 
                        this.eventKinds.includes(event.kind)) {
                        this.send({ payload: event });
                    }
                }
            });

            // Subscribe to events based on filter
            if (this.hexPubkey) {
                const filter = {
                    authors: [this.hexPubkey],
                    kinds: this.eventKinds
                };
                await this.relay._ws?.sendMessage(['REQ', 'sub', filter] as any);
            }

        } catch (err: any) {
            this.error("Failed to initialize node: " + err.message);
            this.status({ fill: "red", shape: "dot", text: "Error" });
        }
    }

    // Register the node
    RED.nodes.registerType("nostr-npub-filter", function(this: NostrNpubFilterNode, config: NostrNpubFilterDef) {
        // Initialize asynchronously
        initializeNode.call(this, config).catch((err: any) => {
            this.error("Failed to initialize node: " + err.message);
        });
    });
}
