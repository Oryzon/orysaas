import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import { Equal } from "typeorm";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createOrganization, createMembership } from "./helpers/fixtures";
import { UserOrigin } from "../build/core/databases/entities/user.entity";
import { OrganizationMemberRole } from "../build/core/databases/entities/organization-member.entity";
import { TokenType } from "../build/core/databases/entities/token.entity";
import { TokenRepository } from "../build/core/databases/repositories/token.repository";
import { UserRepository } from "../build/core/databases/repositories/user.repository";
import { OrganizationMemberRepository } from "../build/core/databases/repositories/organization-member.repository";
import { OrganizationRepository } from "../build/core/databases/repositories/organization.repository";
import { RefreshTokenRepository } from "../build/core/databases/repositories/refresh-token.repository";

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

    it("requesting account deletion succeeds when the user owns no organization exclusively", async () => {
        const user = await createUser();

        const res = await authed(request, user).delete("/v1/user/me/request");

        expect(res.status).toBe(200);
    });

    it("requesting account deletion is blocked (409) when sole owner of an org that has other members", async () => {
        const user = await createUser();
        const teammate = await createUser();
        const org = await createOrganization();
        await createMembership(user, org, OrganizationMemberRole.OWNER);
        await createMembership(teammate, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, user).delete("/v1/user/me/request");

        expect(res.status).toBe(409);
    });

    it("requesting account deletion is not blocked when sole owner and sole member of an org", async () => {
        const user = await createUser();
        const org = await createOrganization();
        await createMembership(user, org, OrganizationMemberRole.OWNER);

        const res = await authed(request, user).delete("/v1/user/me/request");

        expect(res.status).toBe(200);
    });

    it("requesting account deletion is not blocked when there's a co-owner", async () => {
        const user = await createUser();
        const coOwner = await createUser();
        const org = await createOrganization();
        await createMembership(user, org, OrganizationMemberRole.OWNER);
        await createMembership(coOwner, org, OrganizationMemberRole.OWNER);

        const res = await authed(request, user).delete("/v1/user/me/request");

        expect(res.status).toBe(200);
    });

    it("confirming with an unknown code is rejected (422)", async () => {
        const user = await createUser();

        const res = await authed(request, user).delete("/v1/user/me/confirm").send({ code: "000000" });

        expect(res.status).toBe(422);
    });

    it("confirming with a valid code deletes the account: user, memberships and refresh tokens", async () => {
        const user = await createUser();
        const org = await createOrganization();
        await createMembership(user, org, OrganizationMemberRole.MEMBER);

        const clientRefreshToken = await RefreshTokenRepository.createToken(user.uuid);
        const code = await TokenRepository.createCodeToken(user, TokenType.delete_account, 15);

        const res = await authed(request, user).delete("/v1/user/me/confirm").send({ code });

        expect(res.status).toBe(200);

        const deletedUser = await UserRepository.findOne({ where: { uuid: Equal(user.uuid) } });
        expect(deletedUser).toBeNull();

        const membership = await OrganizationMemberRepository.findOne({ where: { memberUuid: Equal(user.uuid) } });
        expect(membership).toBeNull();

        const stillValidToken = await RefreshTokenRepository.findValid(clientRefreshToken);
        expect(stillValidToken).toBeNull();
    });

    it("confirming deletes an org too when the user was its sole owner and sole member", async () => {
        const user = await createUser();
        const org = await createOrganization();
        await createMembership(user, org, OrganizationMemberRole.OWNER);

        const code = await TokenRepository.createCodeToken(user, TokenType.delete_account, 15);

        const res = await authed(request, user).delete("/v1/user/me/confirm").send({ code });

        expect(res.status).toBe(200);

        const deletedOrg = await OrganizationRepository.findOne({ where: { uuid: Equal(org.uuid) } });
        expect(deletedOrg).toBeNull();
    });
});
