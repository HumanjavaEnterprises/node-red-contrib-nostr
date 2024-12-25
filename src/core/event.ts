import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { NostrEvent } from '../nodes/shared/types';
import { KeyManager } from '../crypto/keys';

export class EventBuilder {
    static async createEvent(
        kind: number,
        content: string,
        privateKey: string,
        tags: string[][] = []
    ): Promise<NostrEvent> {
        const pubkey = KeyManager.getPublicKey(privateKey);
        const created_at = Math.floor(Date.now() / 1000);

        const event = {
            kind,
            content,
            created_at,
            pubkey,
            tags,
            id: '',
            sig: ''
        };

        // Calculate event ID
        const serialized = JSON.stringify([
            0,
            event.pubkey,
            event.created_at,
            event.kind,
            event.tags,
            event.content
        ]);
        event.id = bytesToHex(sha256(Buffer.from(serialized)));

        // Sign the event
        event.sig = await KeyManager.sign(privateKey, event.id);

        return event;
    }

    static async validateEvent(event: NostrEvent): Promise<boolean> {
        // Verify all required fields exist
        if (!event.id || !event.pubkey || !event.created_at || 
            !event.kind || !event.tags || !event.content || !event.sig) {
            return false;
        }

        // Verify event ID
        const serialized = JSON.stringify([
            0,
            event.pubkey,
            event.created_at,
            event.kind,
            event.tags,
            event.content
        ]);
        const id = bytesToHex(sha256(Buffer.from(serialized)));
        if (id !== event.id) {
            return false;
        }

        // Verify signature
        return await KeyManager.verify(event.pubkey, event.id, event.sig);
    }
}
