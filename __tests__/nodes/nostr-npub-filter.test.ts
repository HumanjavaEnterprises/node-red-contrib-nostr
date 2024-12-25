import { describe, it, expect, beforeEach } from 'vitest';
import { createTestRED, createMockEvent } from '../test-helper';

describe('nostr-npub-filter Node', () => {
    let RED: any;

    beforeEach(() => {
        RED = createTestRED();
    });

    it('should initialize with valid npub', async () => {
        const node = await RED.nodes.getNode('test-npub-filter');
        expect(node).toBeDefined();
        expect(node.npub).toBeDefined();
        expect(node.hexPubkey).toBeDefined();
    });

    it('should filter events by npub', async () => {
        const node = await RED.nodes.getNode('test-npub-filter');
        expect(node).toBeDefined();

        // Set up test events
        const matchingEvent = createMockEvent(1, 'test', node.hexPubkey);
        const nonMatchingEvent = createMockEvent(1, 'test', 'different-pubkey');

        // Test matching event
        node.relay._ws.mockReceiveMessage(matchingEvent);
        expect(node.send).toHaveBeenCalledWith({ payload: matchingEvent.event });

        // Test non-matching event
        node.relay._ws.mockReceiveMessage(nonMatchingEvent);
        expect(node.send).toHaveBeenCalledTimes(1); // Should not have been called again
    });

    it('should handle missing relay config', async () => {
        const node = await RED.nodes.getNode('test-npub-filter');
        node.relay = null;

        expect(node.error).toHaveBeenCalledWith('No relay config node');
    });
});
