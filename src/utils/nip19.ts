import { bech32 } from 'bech32';

export class NIP19 {
    static npubEncode(pubkey: string): string {
        const words = bech32.toWords(Buffer.from(pubkey, 'hex'));
        return bech32.encode('npub', words);
    }

    static npubDecode(npub: string): string {
        const { words } = bech32.decode(npub);
        const bytes = Buffer.from(bech32.fromWords(words));
        return bytes.toString('hex');
    }

    static nsecEncode(privkey: string): string {
        const words = bech32.toWords(Buffer.from(privkey, 'hex'));
        return bech32.encode('nsec', words);
    }

    static nsecDecode(nsec: string): string {
        const { words } = bech32.decode(nsec);
        const bytes = Buffer.from(bech32.fromWords(words));
        return bytes.toString('hex');
    }

    static noteEncode(id: string): string {
        const words = bech32.toWords(Buffer.from(id, 'hex'));
        return bech32.encode('note', words);
    }

    static noteDecode(note: string): string {
        const { words } = bech32.decode(note);
        const bytes = Buffer.from(bech32.fromWords(words));
        return bytes.toString('hex');
    }
}
