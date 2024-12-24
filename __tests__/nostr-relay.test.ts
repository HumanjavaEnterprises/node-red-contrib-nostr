import { describe, it, expect, beforeEach, vi } from 'vitest';
import pino from 'pino';
import { mockNostrRelay } from '../__mocks__/nostr-relay-mock';
import { mockNostrEvent } from '../__mocks__/nostr-event-mock';

const logger = pino({
    level: 'debug',
    transport: {
        target: 'pino-pretty'
    }
});

// Mock Node-RED runtime
const RED = {
    nodes: {
        createNode: vi.fn(),
        registerType: vi.fn()
    }
};

describe('Nostr Relay Node', () => {
    let relay: any;
    
    beforeEach(() => {
        vi.clearAllMocks();
        relay = mockNostrRelay();
    });

    it('should register the node type', () => {
        expect(RED.nodes.registerType).toHaveBeenCalledWith('nostr-relay', expect.any(Function));
    });

    it('should connect to relay successfully', async () => {
        logger.info('Testing relay connection');
        const connected = await relay.connect();
        expect(connected).toBe(true);
        expect(relay.getStatus()).toBe('connected');
    });

    it('should handle incoming text note events', async () => {
        const mockEvent = mockNostrEvent({
            kind: 1,
            content: 'Hello Nostr!'
        });
        
        const result = await relay.handleEvent(mockEvent);
        expect(result.success).toBe(true);
        expect(result.event.kind).toBe(1);
        expect(result.event.content).toBe('Hello Nostr!');
    });

    it('should handle profile metadata events', async () => {
        const mockProfile = mockNostrEvent({
            kind: 0,
            content: JSON.stringify({
                name: 'Test User',
                about: 'Test Bio'
            })
        });
        
        const result = await relay.handleEvent(mockProfile);
        expect(result.success).toBe(true);
        expect(result.event.kind).toBe(0);
        expect(JSON.parse(result.event.content)).toHaveProperty('name', 'Test User');
    });

    it('should handle subscription to user events', async () => {
        const pubkey = 'test-pubkey';
        const subscription = await relay.subscribe([{
            kinds: [0, 1],
            authors: [pubkey]
        }]);
        
        expect(subscription.id).toBeDefined();
        expect(subscription.filters).toContainEqual(expect.objectContaining({
            kinds: [0, 1],
            authors: [pubkey]
        }));
    });
});
