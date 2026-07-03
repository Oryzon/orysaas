import { ValueTransformer } from "typeorm";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Uint8Array.from(Buffer.from(process.env.API_KEY_SECRET!, "hex"));

const fromHex = (s: string): Uint8Array => Uint8Array.from(Buffer.from(s, "hex"));

export class EncryptedTransformer implements ValueTransformer {
    to(value: string | null): string | null {
        if (value === null || value === undefined) return null;

        const iv = Uint8Array.from(randomBytes(12));
        const cipher = createCipheriv(ALGORITHM, KEY, iv);
        const encrypted = cipher.update(value, "utf8", "hex") + cipher.final("hex");
        const tag = cipher.getAuthTag();

        return [Buffer.from(iv).toString("hex"), tag.toString("hex"), encrypted].join(":");
    }

    from(value: string | null): string | null {
        if (value === null || value === undefined) return null;

        const [ivHex, tagHex, encryptedHex] = value.split(":");
        const decipher = createDecipheriv(ALGORITHM, KEY, fromHex(ivHex));
        decipher.setAuthTag(fromHex(tagHex));

        return decipher.update(encryptedHex, "hex", "utf8") + decipher.final("utf8");
    }
}