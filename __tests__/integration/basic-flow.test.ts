import { describe, it, expect } from 'vitest';
import NostrRelayConfig from '../../src/nodes/nostr-relay-config/nostr-relay-config';
import NostrFilter from '../../src/nodes/nostr-filter/nostr-filter';
import NostrNpubFilter from '../../src/nodes/nostr-npub-filter/nostr-npub-filter';

describe('Node Registration', () => {
    it('should have required node properties', () => {
        // Check relay config node
        expect(NostrRelayConfig).toBeDefined();
        expect(typeof NostrRelayConfig).toBe('function');
        expect(NostrRelayConfig.toString()).toContain('function');

        // Check filter node
        expect(NostrFilter).toBeDefined();
        expect(typeof NostrFilter).toBe('function');
        expect(NostrFilter.toString()).toContain('function');

        // Check npub filter node
        expect(NostrNpubFilter).toBeDefined();
        expect(typeof NostrNpubFilter).toBe('function');
        expect(NostrNpubFilter.toString()).toContain('function');
    });
});
