import { describe, it, expect, beforeEach } from 'vitest';
import { createTestRED, createMockEvent } from '../test-helper';

describe('nostr-filter Node', () => {
    let RED: any;

    beforeEach(() => {
        RED = createTestRED();
    });

    it('should filter events by kind', async () => {
        const node = await RED.nodes.getNode('test-filter');
        expect(node).toBeDefined();

        // Set up kind filter
        node.filterType = 'kind';
        node.kind = 1;

        // Create test events
        const matchingEvent = createMockEvent(1);
        const nonMatchingEvent = createMockEvent(2);

        // Test matching event
        node.relay._ws.mockReceiveMessage(matchingEvent);
        expect(node.send).toHaveBeenCalledWith({ payload: matchingEvent.event });

        // Test non-matching event
        node.relay._ws.mockReceiveMessage(nonMatchingEvent);
        expect(node.send).toHaveBeenCalledTimes(1); // Should not have been called again
    });

    it('should filter events by tag', async () => {
        const node = await RED.nodes.getNode('test-filter');
        expect(node).toBeDefined();

        // Set up tag filter
        node.filterType = 'tag';
        node.tagName = 'p';
        node.tagValue = 'test-pubkey';

        // Create test events
        const matchingEvent = createMockEvent();
        matchingEvent.event.tags = [['p', 'test-pubkey']];

        const nonMatchingEvent = createMockEvent();
        nonMatchingEvent.event.tags = [['p', 'different-pubkey']];

        // Test matching event
        node.relay._ws.mockReceiveMessage(matchingEvent);
        expect(node.send).toHaveBeenCalledWith({ payload: matchingEvent.event });

        // Test non-matching event
        node.relay._ws.mockReceiveMessage(nonMatchingEvent);
        expect(node.send).toHaveBeenCalledTimes(1); // Should not have been called again
    });

    it('should handle missing relay config', async () => {
        const node = await RED.nodes.getNode('test-filter');
        node.relay = null;

        expect(node.error).toHaveBeenCalledWith('No relay config node');
    });
});
