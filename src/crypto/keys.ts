import * as secp256k1 from '@noble/secp256k1';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';

export class KeyManager {
    static generatePrivateKey(): string {
        const privateKey = secp256k1.utils.randomPrivateKey();
        return bytesToHex(privateKey);
    }

    static getPublicKey(privateKey: string): string {
        const publicKey = secp256k1.getPublicKey(hexToBytes(privateKey));
        return bytesToHex(publicKey);
    }

    static async sign(privateKey: string, message: string): Promise<string> {
        const messageHash = sha256(Buffer.from(message));
        const signature = await secp256k1.sign(messageHash, hexToBytes(privateKey));
        return bytesToHex(signature.toCompactRawBytes());
    }

    static async verify(
        publicKey: string,
        message: string,
        signature: string
    ): Promise<boolean> {
        const messageHash = sha256(Buffer.from(message));
        return await secp256k1.verify(
            hexToBytes(signature),
            messageHash,
            hexToBytes(publicKey)
        );
    }
}
