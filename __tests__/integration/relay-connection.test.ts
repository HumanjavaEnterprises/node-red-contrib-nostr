import { describe, it, expect } from 'vitest';
import { NostrWSClient } from '../../__mocks__/nostr-websocket-utils';

describe('Relay Connection', () => {
    it('should connect to relay', async () => {
        const ws = new NostrWSClient('wss://nos.lol');
        let connected = false;

        ws.on('open', () => {
            connected = true;
        });

        await ws.connect();

        // Wait up to 1 second for connection
        for (let i = 0; i < 10; i++) {
            if (connected) break;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        expect(connected).toBe(true);
        expect(ws.isConnected()).toBe(true);

        // Clean up
        ws.close();
    });

    it('should receive events', async () => {
        const ws = new NostrWSClient('wss://nos.lol');
        let eventReceived = false;

        ws.on('message', (msg) => {
            if (msg.type === 'EVENT') {
                eventReceived = true;
            }
        });

        await ws.connect();

        // Subscribe to kind 1 events
        ws.subscribe('test', { kinds: [1] });

        // Simulate receiving an event
        ws.mockReceiveMessage({
            type: 'EVENT',
            event: {
                kind: 1,
                content: 'test',
                pubkey: 'test-pubkey',
                id: 'test-id',
                sig: 'test-sig',
                created_at: Math.floor(Date.now() / 1000)
            }
        });

        expect(eventReceived).toBe(true);

        // Clean up
        ws.close();
    });
});
