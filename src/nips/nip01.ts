import { NostrEvent, NostrFilter } from '../nodes/shared/types';

export enum MessageType {
    EVENT = 'EVENT',
    REQ = 'REQ',
    CLOSE = 'CLOSE',
    NOTICE = 'NOTICE',
    EOSE = 'EOSE',
    OK = 'OK'
}

export interface RelayMessage {
    type: MessageType;
    subscriptionId?: string;
    event?: NostrEvent;
    message?: string;
    filters?: NostrFilter[];
    success?: boolean;
    error?: string;
}

export function parseRelayMessage(message: string): RelayMessage | null {
    try {
        const parsed = JSON.parse(message);
        if (!Array.isArray(parsed)) return null;

        const [type, ...params] = parsed;

        switch (type as MessageType) {
            case MessageType.EVENT:
                const [subscriptionId, event] = params;
                return {
                    type: MessageType.EVENT,
                    subscriptionId,
                    event
                };

            case MessageType.NOTICE:
                return {
                    type: MessageType.NOTICE,
                    message: params[0]
                };

            case MessageType.EOSE:
                return {
                    type: MessageType.EOSE,
                    subscriptionId: params[0]
                };

            case MessageType.OK:
                const [eventId, success, message] = params;
                return {
                    type: MessageType.OK,
                    message: eventId,
                    success,
                    error: message
                };

            default:
                return null;
        }
    } catch {
        return null;
    }
}

export function createEventMessage(event: NostrEvent): string {
    return JSON.stringify([MessageType.EVENT, event]);
}

export function createSubscriptionMessage(subscriptionId: string, filters: NostrFilter[]): string {
    return JSON.stringify([MessageType.REQ, subscriptionId, ...filters]);
}

export function createCloseMessage(subscriptionId: string): string {
    return JSON.stringify([MessageType.CLOSE, subscriptionId]);
}
