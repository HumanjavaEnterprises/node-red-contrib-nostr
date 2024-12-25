export class Validation {
    static isValidHexString(str: string): boolean {
        return /^[0-9a-f]+$/i.test(str);
    }

    static isValidPubkey(pubkey: string): boolean {
        return this.isValidHexString(pubkey) && pubkey.length === 64;
    }

    static isValidEventId(id: string): boolean {
        return this.isValidHexString(id) && id.length === 64;
    }

    static isValidSignature(signature: string): boolean {
        return this.isValidHexString(signature) && signature.length === 128;
    }

    static isValidRelayUrl(url: string): boolean {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'wss:' || parsed.protocol === 'ws:';
        } catch {
            return false;
        }
    }

    static isValidTimestamp(timestamp: number): boolean {
        const now = Math.floor(Date.now() / 1000);
        return timestamp > 0 && timestamp <= now;
    }
}
