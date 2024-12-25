import { Node, NodeDef } from 'node-red';

export interface NostrRelayDef extends NodeDef {
    relayUrl: string;
}

export interface NostrRelayNode extends Node {
    relayUrl: string;
    ws?: WebSocket;
}

export interface NostrEvent {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig: string;
}

export interface NostrFilter {
    ids?: string[];
    authors?: string[];
    kinds?: number[];
    since?: number;
    until?: number;
    limit?: number;
    search?: string;
}
