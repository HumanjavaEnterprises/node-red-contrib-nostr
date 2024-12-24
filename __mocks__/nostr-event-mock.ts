import type { Event as NostrEvent } from 'nostr-tools';

interface EventParams {
    kind?: number;
    content?: string;
    tags?: string[][];
    pubkey?: string;
}

export const mockNostrEvent = (params: EventParams = {}): NostrEvent => {
    const timestamp = Math.floor(Date.now() / 1000);
    
    return {
        id: `mock_event_${Math.random().toString(36).substr(2, 9)}`,
        pubkey: params.pubkey || 'mock_pubkey_123',
        created_at: timestamp,
        kind: params.kind || 1,
        tags: params.tags || [],
        content: params.content || 'Mock event content',
        sig: 'mock_signature_123'
    };
};
