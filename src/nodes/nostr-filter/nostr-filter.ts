import { Node, NodeAPI, NodeDef } from 'node-red';
import { NostrEvent } from '../../nodes/shared/types';
import { NostrRelayConfig } from '../nostr-relay-config/nostr-relay-config.js';


interface NostrFilterDef extends NodeDef {
    relay: string;  // ID of the relay config node
    filterType: 'npub' | 'kind' | 'tag' | 'since' | 'custom';
    npubValue: string;
    npubEventKinds: number[];
    eventKinds: number[];
    tagName: string;
    tagValue: string;
    sinceMinutes: number;
    customFilter: string;
}

interface NostrFilterNode extends Node {
    relay: NostrRelayConfig;
    filterType: 'npub' | 'kind' | 'tag' | 'since' | 'custom';
    npubValue: string;
    npubEventKinds: number[];
    eventKinds: number[];
    tagName: string;
    tagValue: string;
    sinceMinutes: number;
    customFilter: string;
    hexPubkey?: string;
}

export default function(RED: NodeAPI) {
    // Create a function to initialize the node
    async function initializeNode(this: NostrFilterNode, config: NostrFilterDef) {
        RED.nodes.createNode(this, config);

        // Get the relay configuration node
        this.relay = RED.nodes.getNode(config.relay) as NostrRelayConfig;
        if (!this.relay) {
            this.error("No relay configuration found");
            this.status({ fill: "red", shape: "ring", text: "Missing relay config" });
            return;
        }

        this.filterType = config.filterType;
        this.npubValue = config.npubValue;
        this.npubEventKinds = config.npubEventKinds || [0, 1]; // Default to metadata and text notes
        this.eventKinds = config.eventKinds;
        this.tagName = config.tagName;
        this.tagValue = config.tagValue;
        this.sinceMinutes = config.sinceMinutes;
        this.customFilter = config.customFilter;

        try {
            // Dynamically import ESM dependencies
            const { nip19 } = await import('nostr-tools');

            // Convert npub to hex if needed
            if (this.filterType === 'npub' && this.npubValue) {
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

                    // Apply filters based on type
                    let shouldForward = false;

                    switch (this.filterType) {
                        case 'npub':
                            if (this.hexPubkey && event.pubkey === this.hexPubkey) {
                                shouldForward = this.npubEventKinds.includes(event.kind);
                            }
                            break;

                        case 'kind':
                            shouldForward = this.eventKinds.includes(event.kind);
                            break;

                        case 'tag':
                            if (this.tagName && this.tagValue) {
                                shouldForward = event.tags.some(tag => 
                                    tag[0] === this.tagName && tag[1] === this.tagValue
                                );
                            }
                            break;

                        case 'since':
                            if (this.sinceMinutes > 0) {
                                const cutoff = Math.floor(Date.now() / 1000) - (this.sinceMinutes * 60);
                                shouldForward = event.created_at >= cutoff;
                            }
                            break;

                        case 'custom':
                            if (this.customFilter) {
                                try {
                                    const filter = JSON.parse(this.customFilter);
                                    shouldForward = Object.entries(filter).every(([key, value]) => {
                                        if (Array.isArray(value)) {
                                            return value.includes(event[key as keyof NostrEvent]);
                                        }
                                        return event[key as keyof NostrEvent] === value;
                                    });
                                } catch (err: any) {
                                    this.error("Invalid custom filter: " + err.message);
                                }
                            }
                            break;
                    }

                    if (shouldForward) {
                        this.send({ payload: event });
                    }
                }
            });

            // Subscribe to events based on filter
            const filter: any = {};

            switch (this.filterType) {
                case 'npub':
                    if (this.hexPubkey) {
                        filter.authors = [this.hexPubkey];
                        filter.kinds = this.npubEventKinds;
                    }
                    break;

                case 'kind':
                    filter.kinds = this.eventKinds;
                    break;

                case 'tag':
                    if (this.tagName && this.tagValue) {
                        filter[`#${this.tagName}`] = [this.tagValue];
                    }
                    break;

                case 'since':
                    if (this.sinceMinutes > 0) {
                        filter.since = Math.floor(Date.now() / 1000) - (this.sinceMinutes * 60);
                    }
                    break;

                case 'custom':
                    if (this.customFilter) {
                        try {
                            Object.assign(filter, JSON.parse(this.customFilter));
                        } catch (err: any) {
                            this.error("Invalid custom filter: " + err.message);
                        }
                    }
                    break;
            }

            if (Object.keys(filter).length > 0) {
                await this.relay._ws?.sendMessage(['REQ', 'sub', filter] as any);
            }

        } catch (err: any) {
            this.error("Failed to initialize node: " + err.message);
            this.status({ fill: "red", shape: "dot", text: "Error" });
        }
    }

    // Register the node
    RED.nodes.registerType("nostr-filter", function(this: NostrFilterNode, config: NostrFilterDef) {
        // Initialize asynchronously
        initializeNode.call(this, config).catch((err: any) => {
            this.error("Failed to initialize node: " + err.message);
        });
    });
}
