// utils/encryption.js
import crypto from 'crypto';


const algorithm = 'aes-256-cbc'; // Choose an algorithm
const IV_LENGTH = 16; // For AES, this is always 16 bytes

// Retrieve your encryption key securely from environment variables
// This key MUST be 32 bytes (256 bits) for aes-256-cbc
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a'.repeat(32); // Use a strong, random 32-byte key in production

if (ENCRYPTION_KEY.length !== 32) {
    console.warn("WARNING: ENCRYPTION_KEY must be 32 bytes for aes-256-cbc. Generating a dummy key.");
    // Fallback for development if key isn't set, DON'T USE IN PRODUCTION
    const dummyKey = crypto.randomBytes(16).toString('hex').slice(0, 32);
    process.env.ENCRYPTION_KEY = dummyKey;
    ENCRYPTION_KEY = dummyKey;
}

const encrypt = (text) => {
    if (!text) return text; // Handle null/undefined/empty string
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    if (!text) return text; // Handle null/undefined/empty string
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error.message);
        return null; // Return null or throw an error for failed decryption
    }
};

export { encrypt, decrypt };