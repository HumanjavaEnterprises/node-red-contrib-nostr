import { Node, NodeDef } from 'node-red';

export interface NostrRelayConfigNode extends Node {
    name: string;
    url: string;
    proxy?: boolean;
    proxyUrl?: string;
}

export interface NostrRelayConfig extends NodeDef {
    name: string;
    url: string;
    proxy?: boolean;
    proxyUrl?: string;
}

export interface NostrFilterConfig extends NodeDef {
    name: string;
    relay: string;
    kinds?: number[];
    authors?: string[];
    tags?: { [key: string]: string[] };
    since?: number;
    until?: number;
    limit?: number;
}

export interface NostrRelayNodeConfig extends NodeDef {
    name: string;
    relay: string;
    kind?: number;
    content?: string;
    tags?: { [key: string]: string[] };
}
