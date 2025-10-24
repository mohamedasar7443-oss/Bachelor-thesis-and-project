let crypto: Crypto;

// Determine environment and set up the crypto object
if (typeof window === 'undefined') {
    // Server-side - use polyfill
    const { Crypto } = require('@peculiar/webcrypto');
    crypto = new Crypto();
} else {
    // Client-side - use browser's native crypto
    crypto = window.crypto;
}

export async function encryptData(password: string, data: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encodedData = new TextEncoder().encode(data);
    const encryptedContent = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedData);
    return {
        salt: Array.from(salt),
        iv: Array.from(iv),
        encryptedContent: Array.from(new Uint8Array(encryptedContent))
    };
}

export async function decryptData(password: string, encryptedData: any) {
    const salt = new Uint8Array(encryptedData.salt);
    const iv = new Uint8Array(encryptedData.iv);
    const key = await deriveKey(password, salt);
    const data = new Uint8Array(encryptedData.encryptedContent);
    try {
        const decryptedContent = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );
        return new TextDecoder().decode(decryptedContent);
    } catch (error) {
        throw new Error('Decryption Failed');
    }
}

export async function deriveKey(password: string, salt: Uint8Array) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}