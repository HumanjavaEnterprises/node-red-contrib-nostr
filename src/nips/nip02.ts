import { NostrEvent } from '../nodes/shared/types';
import { EventBuilder } from '../core/event';

export interface Contact {
    pubkey: string;
    relayUrl: string;
    petname?: string;
}

export class ContactList {
    static parseContactList(event: NostrEvent): Contact[] {
        if (event.kind !== 3) throw new Error('Not a contact list event');

        return event.tags
            .filter(tag => tag[0] === 'p')
            .map(tag => ({
                pubkey: tag[1],
                relayUrl: tag[2] || '',
                petname: tag[3]
            }));
    }

    static async createContactListEvent(
        contacts: Contact[],
        privateKey: string
    ): Promise<NostrEvent> {
        const tags = contacts.map(contact => [
            'p',
            contact.pubkey,
            contact.relayUrl,
            contact.petname || ''
        ]);

        return await EventBuilder.createEvent(
            3,
            '', // Content can be empty or contain additional metadata
            privateKey,
            tags
        );
    }

    static getContactListFilter(pubkey: string) {
        return {
            kinds: [3],
            authors: [pubkey],
            limit: 1
        };
    }
}
