import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import { buildTestApp, authed } from "./helpers/request";
import { createUser } from "./helpers/fixtures";
import { UserOrigin } from "../build/core/databases/entities/user.entity";

describe("[ User Profile ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("GET /user/me never returns the password", async () => {
        const user = await createUser();

        const res = await authed(request, user).get("/v1/user/me");

        expect(res.status).toBe(200);
        expect(res.body.password).toBeUndefined();
    });

    it("changing password with a wrong current password is rejected (401)", async () => {
        const user = await createUser({ password: "correctpassword" });

        const res = await authed(request, user)
            .put("/v1/user/me/password")
            .send({ currentPassword: "wrongpassword", newPassword: "newpassword123" });

        expect(res.status).toBe(401);
    });

    it("a social account cannot change its password (403)", async () => {
        const user = await createUser({ origin: UserOrigin.GOOGLE });

        const res = await authed(request, user)
            .put("/v1/user/me/password")
            .send({ currentPassword: "whatever", newPassword: "newpassword123" });

        expect(res.status).toBe(403);
    });

    it("changing password with the correct current password works", async () => {
        const user = await createUser({ password: "correctpassword" });

        const res = await authed(request, user)
            .put("/v1/user/me/password")
            .send({ currentPassword: "correctpassword", newPassword: "newpassword123" });

        expect(res.status).toBe(200);
    });

    it("a tampered JWT with isSaasAdmin: true doesn't grant admin rights (defense in depth)", async () => {
        const user = await createUser({ isSaasAdmin: false });

        const forgedToken = jwt.sign({ uuid: user.uuid, isSaasAdmin: true }, process.env.JWT_SECRET!);

        const res = await request.get("/v1/settings/").set("Authorization", `Bearer ${forgedToken}`);

        expect(res.status).toBe(403);
    });
});
