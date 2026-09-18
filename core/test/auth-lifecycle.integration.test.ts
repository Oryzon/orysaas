import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { Equal } from "typeorm";
import { buildTestApp } from "./helpers/request";
import { createUser, issueToken } from "./helpers/fixtures";
import { TokenType } from "../build/core/databases/entities/token.entity";
import { UserRepository } from "../build/core/databases/repositories/user.repository";

describe("[ Account Lifecycle ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("register creates an inactive user", async () => {
        const email = `register-${Date.now()}@example.test`;

        const res = await request.post("/v1/auth/register").send({
            firstname: "Jean",
            lastname: "Dupont",
            email,
            password: "password123",
        });

        expect(res.status).toBe(200);

        const user = await UserRepository.findOne({ where: { email: Equal(email) } });
        expect(user).not.toBeNull();
        expect(user!.isActive).toBe(false);
    });

    it("register with an already used email is rejected (422)", async () => {
        const user = await createUser();

        const res = await request.post("/v1/auth/register").send({
            firstname: "Jean",
            lastname: "Dupont",
            email: user.email,
            password: "password123",
        });

        expect(res.status).toBe(422);
    });

    it("verify with a valid token activates the account", async () => {
        const user = await createUser({ isActive: false });
        const token = await issueToken(user, TokenType.verify_account);

        const res = await request.get(`/v1/auth/verify?token=${token.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("activé");

        const updated = await UserRepository.findOne({ where: { email: Equal(user.email) } });
        expect(updated!.isActive).toBe(true);
    });

    it("verify with an unknown token returns 200 with an invalidity message", async () => {
        const res = await request.get("/v1/auth/verify?token=inconnu-123");

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("invalide");
    });

    it("verify with an already used token reports it", async () => {
        const user = await createUser({ isActive: false });
        const token = await issueToken(user, TokenType.verify_account);

        await request.get(`/v1/auth/verify?token=${token.token}`);
        const res = await request.get(`/v1/auth/verify?token=${token.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("déjà activé");
    });

    it("forgot-password responds the same whether the email exists or not (anti-enumeration)", async () => {
        const user = await createUser();

        const resExisting = await request.post("/v1/auth/forgot-password").send({ email: user.email });
        const resUnknown = await request.post("/v1/auth/forgot-password").send({ email: "inconnu@example.test" });

        expect(resExisting.status).toBe(200);
        expect(resUnknown.status).toBe(200);
        expect(resExisting.body.message).toBe(resUnknown.body.message);
    });

    it("reset-password rejects a password that's too short", async () => {
        const user = await createUser();
        const token = await issueToken(user, TokenType.reset_password, 1);

        const res = await request.post("/v1/auth/reset-password").send({
            token: token.token,
            newPassword: "short",
            confNewPassword: "short",
        });

        expect(res.status).toBe(422);
    });

    it("reset-password rejects a confirmation that doesn't match", async () => {
        const user = await createUser();
        const token = await issueToken(user, TokenType.reset_password, 1);

        const res = await request.post("/v1/auth/reset-password").send({
            token: token.token,
            newPassword: "newpassword123",
            confNewPassword: "different123",
        });

        expect(res.status).toBe(422);
    });

    it("a valid reset-password then allows logging in with the new password", async () => {
        const user = await createUser({ password: "oldpassword123" });
        const token = await issueToken(user, TokenType.reset_password, 1);

        const resetRes = await request.post("/v1/auth/reset-password").send({
            token: token.token,
            newPassword: "newpassword123",
            confNewPassword: "newpassword123",
        });

        expect(resetRes.status).toBe(200);

        const loginRes = await request.post("/v1/auth/login").send({
            email: user.email,
            password: "newpassword123",
        });

        expect(loginRes.status).toBe(200);
        expect(typeof loginRes.body.token).toBe("string");
    });

    it("refresh without a refreshToken returns 401", async () => {
        const res = await request.post("/v1/auth/refresh").send({});
        expect(res.status).toBe(401);
    });

    it("refresh with an invalid refreshToken returns 401", async () => {
        const res = await request.post("/v1/auth/refresh").send({ refreshToken: "inconnu" });
        expect(res.status).toBe(401);
    });
});
