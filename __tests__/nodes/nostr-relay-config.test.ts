import { describe, it, expect, beforeEach } from 'vitest';
import { createTestRED } from '../test-helper';
import { NostrWSClient } from '../../__mocks__/nostr-websocket-utils';

describe('nostr-relay-config Node', () => {
    let RED: any;

    beforeEach(() => {
        RED = createTestRED();
    });

    it('should initialize and connect to relay', async () => {
        const node = await RED.nodes.getNode('test-relay-config');
        expect(node).toBeDefined();
        expect(node._ws).toBeDefined();
        expect(node._ws).toBeInstanceOf(NostrWSClient);
        expect(node._ws.isConnected()).toBe(true);
    });

    it('should clean up on close', async () => {
        const node = await RED.nodes.getNode('test-relay-config');
        expect(node._ws.isConnected()).toBe(true);
        
        // Close the node
        node.close();
        expect(node._ws.isConnected()).toBe(false);
    });
});
