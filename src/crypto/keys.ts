import { secp256k1 } from '@noble/curves/secp256k1.js';
import { bech32 } from 'bech32';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { sha256 } from '@noble/hashes/sha2.js';

// Lazily-initialized ephemeral key pair for read-only operations.
// Generated at first use so no secret material is stored in source code.
let _defaultReaderKeys: { privateKey: string; publicKey: string } | null = null;

export async function getDefaultReaderKeys(): Promise<{ privateKey: string; publicKey: string }> {
    if (!_defaultReaderKeys) {
        _defaultReaderKeys = await generateKeyPair();
    }
    return _defaultReaderKeys;
}

/**
 * Generate a new Nostr key pair
 * @returns {Promise<Object>} Object containing private and public keys
 */
export async function generateKeyPair() {
    const privateKey = secp256k1.utils.randomSecretKey();
    const publicKey = secp256k1.getPublicKey(privateKey, true);

    return {
        privateKey: bytesToHex(privateKey),
        publicKey: bytesToHex(publicKey)
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
    const publicKey = secp256k1.getPublicKey(hexToBytes(privateKeyHex), true);
    return bytesToHex(publicKey);
}

export class KeyManager {
    async generatePrivateKey(): Promise<string> {
        const privateKey = secp256k1.utils.randomSecretKey();
        return bytesToHex(privateKey);
    }

    async getPublicKey(privateKey: string): Promise<string> {
        const publicKey = secp256k1.getPublicKey(hexToBytes(privateKey), true);
        return bytesToHex(publicKey);
    }

    async sign(
        privateKey: string,
        message: string
    ): Promise<string> {
        const messageHash = sha256(new TextEncoder().encode(message));
        const signature = secp256k1.sign(messageHash, hexToBytes(privateKey));
        return bytesToHex(signature);
    }

    async verify(
        publicKey: string,
        message: string,
        signature: string
    ): Promise<boolean> {
        const messageHash = sha256(new TextEncoder().encode(message));
        return secp256k1.verify(hexToBytes(signature), messageHash, hexToBytes(publicKey));
    }
}
