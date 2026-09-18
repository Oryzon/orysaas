import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import { buildTestApp } from "./helpers/request";
import { createUser } from "./helpers/fixtures";
import { UserOrigin } from "../build/core/databases/entities/user.entity";

describe("[ Authentication ]", () => {
    let app: Application;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    it("successful login returns a valid JWT", async () => {
        await createUser({ email: "login@example.test", password: "password123" });

        const res = await supertest(app)
            .post("/v1/auth/login")
            .send({ email: "login@example.test", password: "password123" });

        expect(res.status).toBe(200);
        expect(typeof res.body.token).toBe("string");

        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET) as { uuid: string };
        expect(decoded.uuid).toBeDefined();
    });

    it("login with a wrong password returns 422", async () => {
        await createUser({ email: "wrongpass@example.test", password: "password123" });

        const res = await supertest(app)
            .post("/v1/auth/login")
            .send({ email: "wrongpass@example.test", password: "not-the-password" });

        expect(res.status).toBe(422);
    });

    it("local login for an account created via a social provider is rejected", async () => {
        await createUser({ email: "social@example.test", origin: UserOrigin.GOOGLE });

        const res = await supertest(app)
            .post("/v1/auth/login")
            .send({ email: "social@example.test", password: "password123" });

        expect(res.status).toBe(422);
    });

    it("a protected route without a token returns 403", async () => {
        const res = await supertest(app).get("/v1/user/me");

        expect(res.status).toBe(403);
    });

    it("an expired JWT returns 401", async () => {
        const user = await createUser();

        const expiredToken = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET, { expiresIn: -10 });

        const res = await supertest(app).get("/v1/user/me").set("Authorization", `Bearer ${expiredToken}`);

        expect(res.status).toBe(401);
    });

    it("a disabled user (isActive: false) returns 403", async () => {
        const user = await createUser({ isActive: false });

        const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET);

        const res = await supertest(app).get("/v1/user/me").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});
