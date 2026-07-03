import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const key = () => Buffer.from(process.env.API_KEY_SECRET!, "hex") as any;

export function encrypt(value: string): string {
    const iv = randomBytes(12) as any;
    const cipher = createCipheriv(ALGO, key(), iv);
    const encrypted = cipher.update(value, "utf8", "hex") + cipher.final("hex");
    const tag = (cipher.getAuthTag() as Buffer).toString("hex");
    return `${(iv as Buffer).toString("hex")}:${tag}:${encrypted}`;
}

export function decrypt(stored: string): string {
    const [ivHex, tagHex, encryptedHex] = stored.split(":");
    const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivHex, "hex") as any);
    decipher.setAuthTag(Buffer.from(tagHex, "hex") as any);
    return decipher.update(encryptedHex, "hex", "utf8") + decipher.final("utf8");
}