// Types only
import type * as secp256k1Type from '@noble/secp256k1';
import { bech32 } from 'bech32';
import { bytesToHex } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';

// Lazily-initialized ephemeral key pair for read-only operations.
// Generated at first use so no secret material is stored in source code.
let _defaultReaderKeys: { privateKey: string; publicKey: string } | null = null;

export async function getDefaultReaderKeys(): Promise<{ privateKey: string; publicKey: string }> {
    if (!_defaultReaderKeys) {
        _defaultReaderKeys = await generateKeyPair();
    }
    return _defaultReaderKeys;
}

let secp256k1: typeof secp256k1Type;

async function initSecp256k1() {
    if (!secp256k1) {
        secp256k1 = await import('@noble/secp256k1');
    }
    return secp256k1;
}

/**
 * Generate a new Nostr key pair
 * @returns {Promise<Object>} Object containing private and public keys
 */
export async function generateKeyPair() {
    const secp = await initSecp256k1();
    const privateKey = secp.utils.randomPrivateKey();
    const publicKey = secp.getPublicKey(privateKey, true);
    
    return {
        privateKey: Buffer.from(privateKey).toString('hex'),
        publicKey: Buffer.from(publicKey).toString('hex')
    };
}

/**
 * Convert a hex public key to npub format
 * @param {string} publicKeyHex - Public key in hex format
 * @returns {string} npub formatted public key
 */
export function hexToNpub(publicKeyHex: string): string {
    const words = bech32.toWords(Buffer.from(publicKeyHex, 'hex'));
    return bech32.encode('npub', words);
}

/**
 * Convert an npub to hex format
 * @param {string} npub - npub formatted public key
 * @returns {string} Public key in hex format
 */
export function npubToHex(npub: string): string {
    const { words } = bech32.decode(npub);
    return Buffer.from(bech32.fromWords(words)).toString('hex');
}

/**
 * Get public key from private key
 * @param {string} privateKeyHex - Private key in hex format
 * @returns {Promise<string>} Public key in hex format
 */
export async function getPublicKey(privateKeyHex: string): Promise<string> {
    const secp = await initSecp256k1();
    const publicKey = secp.getPublicKey(privateKeyHex, true);
    return Buffer.from(publicKey).toString('hex');
}

export class KeyManager {
    private secp256k1Promise: Promise<typeof secp256k1Type>;

    constructor() {
        this.secp256k1Promise = initSecp256k1();
    }

    async generatePrivateKey(): Promise<string> {
        const secp = await this.secp256k1Promise;
        const privateKey = secp.utils.randomPrivateKey();
        return Buffer.from(privateKey).toString('hex');
    }

    async getPublicKey(privateKey: string): Promise<string> {
        const secp = await this.secp256k1Promise;
        const publicKey = secp.getPublicKey(privateKey, true);
        return Buffer.from(publicKey).toString('hex');
    }

    async sign(
        privateKey: string,
        message: string
    ): Promise<string> {
        const secp = await this.secp256k1Promise;
        const messageHash = sha256(Buffer.from(message));
        const signature = await secp.sign(messageHash, privateKey);
        return bytesToHex(signature.toCompactRawBytes());
    }

    async verify(
        publicKey: string,
        message: string,
        signature: string
    ): Promise<boolean> {
        const secp = await this.secp256k1Promise;
        const messageHash = sha256(Buffer.from(message));
        return secp.verify(signature, messageHash, publicKey);
    }
}
