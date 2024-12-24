import { vi } from 'vitest';
import type { Event as NostrEvent } from 'nostr-tools';

interface RelayMock {
    connect: () => Promise<boolean>;
    disconnect: () => Promise<boolean>;
    getStatus: () => string;
    handleEvent: (event: NostrEvent) => Promise<{ success: boolean; event: NostrEvent }>;
    subscribe: (filters: any[]) => Promise<{ id: string; filters: any[] }>;
}

export const mockNostrRelay = (): RelayMock => {
    let status = 'disconnected';
    let subscriptions: Map<string, any[]> = new Map();

    return {
        connect: vi.fn().mockImplementation(async () => {
            status = 'connected';
            return true;
        }),

        disconnect: vi.fn().mockImplementation(async () => {
            status = 'disconnected';
            return true;
        }),

        getStatus: vi.fn().mockImplementation(() => status),

        handleEvent: vi.fn().mockImplementation(async (event: NostrEvent) => {
            return {
                success: true,
                event
            };
        }),

        subscribe: vi.fn().mockImplementation(async (filters: any[]) => {
            const id = `sub_${Math.random().toString(36).substr(2, 9)}`;
            subscriptions.set(id, filters);
            return {
                id,
                filters
            };
        })
    };
};
