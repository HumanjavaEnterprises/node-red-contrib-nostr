interface NIP05Response {
    names: {
        [username: string]: string;
    };
    relays?: {
        [pubkey: string]: string[];
    };
}

export class InternetIdentifier {
    static async verify(
        identifier: string,
        pubkey: string
    ): Promise<boolean> {
        try {
            const [name, domain] = identifier.split('@');
            if (!name || !domain) return false;

            const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
            const response = await fetch(url);
            const data: NIP05Response = await response.json();

            return data.names[name] === pubkey;
        } catch {
            return false;
        }
    }

    static parseIdentifier(identifier: string): { name: string; domain: string; } {
        const [name, domain] = identifier.split('@');
        if (!name || !domain) {
            throw new Error('Invalid NIP-05 identifier format');
        }
        return { name, domain };
    }

    static async getRelays(
        identifier: string,
        pubkey: string
    ): Promise<string[]> {
        const { name, domain } = this.parseIdentifier(identifier);
        const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
        
        try {
            const response = await fetch(url);
            const data: NIP05Response = await response.json();
            
            if (data.relays && data.relays[pubkey]) {
                return data.relays[pubkey];
            }
            
            return [];
        } catch {
            return [];
        }
    }
}
