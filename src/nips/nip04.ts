import * as secp256k1 from '@noble/secp256k1';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import { NostrEvent } from '../nodes/shared/types';
import { EventBuilder } from '../core/event';

export class NIP04 {
    static async encrypt(
        privateKey: string,
        publicKey: string,
        text: string
    ): Promise<string> {
        const sharedPoint = secp256k1.getSharedSecret(
            hexToBytes(privateKey),
            hexToBytes(publicKey)
        );
        const sharedX = sharedPoint.slice(1, 33);
        
        // In a real implementation, we'd use this shared secret with
        // proper encryption. This is just a placeholder.
        const key = sha256(sharedX);
        
        // TODO: Implement actual encryption using AES-256-CBC
        return bytesToHex(key);
    }

    static async decrypt(
        privateKey: string,
        publicKey: string,
        encryptedText: string
    ): Promise<string> {
        const sharedPoint = secp256k1.getSharedSecret(
            hexToBytes(privateKey),
            hexToBytes(publicKey)
        );
        const sharedX = sharedPoint.slice(1, 33);
        
        // TODO: Implement actual decryption using AES-256-CBC
        return "decrypted text";
    }

    static async createEncryptedEvent(
        recipientPubkey: string,
        content: string,
        privateKey: string
    ): Promise<NostrEvent> {
        const encryptedContent = await this.encrypt(
            privateKey,
            recipientPubkey,
            content
        );

        const tags = [['p', recipientPubkey]];

        return await EventBuilder.createEvent(
            4, // NIP-04 Direct Message kind
            encryptedContent,
            privateKey,
            tags
        );
    }

    static async decryptEvent(
        event: NostrEvent,
        privateKey: string
    ): Promise<string> {
        if (event.kind !== 4) throw new Error('Not a DM event');

        const recipientTag = event.tags.find(tag => tag[0] === 'p');
        if (!recipientTag) throw new Error('No recipient tag found');

        return await this.decrypt(
            privateKey,
            event.pubkey,
            event.content
        );
    }

    static getDMFilter(pubkey: string, otherPubkey?: string) {
        const filter: any = {
            kinds: [4],
            limit: 100
        };

        if (otherPubkey) {
            filter['#p'] = [otherPubkey];
            filter.authors = [pubkey];
        } else {
            filter.$or = [
                { authors: [pubkey] },
                { '#p': [pubkey] }
            ];
        }

        return filter;
    }
}
