import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../build/core/helpers/crypto.helper";

describe("[ Crypto Helper ]", () => {
    it("an encrypt then decrypt round-trip returns the original value", () => {
        const original = "sk_test_super_secret_key";

        const encrypted = encrypt(original);

        expect(encrypted).not.toBe(original);
        expect(decrypt(encrypted)).toBe(original);
    });

    it("encrypting the same value twice produces different results (random IV)", () => {
        const value = "same-secret-value";

        expect(encrypt(value)).not.toBe(encrypt(value));
    });

    it("a tampered encrypted value fails to decrypt (AES-GCM auth tag)", () => {
        const encrypted = encrypt("sk_test_super_secret_key");
        const [iv, tag, ciphertext] = encrypted.split(":");

        // flip one character of the ciphertext
        const tamperedChar = ciphertext[0] === "0" ? "1" : "0";
        const tampered = `${iv}:${tag}:${tamperedChar}${ciphertext.slice(1)}`;

        expect(() => decrypt(tampered)).toThrow();
    });
});
