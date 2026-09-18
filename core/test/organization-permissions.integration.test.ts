import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createOrganization, createMembership } from "./helpers/fixtures";
import { OrganizationMemberRole } from "../build/core/databases/entities/organization-member.entity";

describe("[ Multi-tenant Permissions ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("a member of org A cannot access org B (403)", async () => {
        const user = await createUser();
        const orgA = await createOrganization();
        const orgB = await createOrganization();
        await createMembership(user, orgA, OrganizationMemberRole.MEMBER);

        const res = await authed(request, user).get(`/v1/tenant/${orgB.slug}/members`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Vous n'êtes pas membre de cette organisation.");
    });

    it("a member of org A can access their own org (200)", async () => {
        const user = await createUser();
        const orgA = await createOrganization();
        await createMembership(user, orgA, OrganizationMemberRole.MEMBER);

        const res = await authed(request, user).get(`/v1/tenant/${orgA.slug}/members`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("a MEMBER role is rejected on a route requiring ADMIN (422)", async () => {
        const memberUser = await createUser();
        const org = await createOrganization();
        const membership = await createMembership(memberUser, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, memberUser)
            .put(`/v1/tenant/${org.slug}/member/${membership.uuid}`)
            .send({ role: OrganizationMemberRole.ADMIN });

        expect(res.status).toBe(422);
    });

    it("an ADMIN role passes the same route (200)", async () => {
        const adminUser = await createUser();
        const targetUser = await createUser();
        const org = await createOrganization();
        await createMembership(adminUser, org, OrganizationMemberRole.ADMIN);
        const target = await createMembership(targetUser, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, adminUser)
            .put(`/v1/tenant/${org.slug}/member/${target.uuid}`)
            .send({ role: OrganizationMemberRole.ADMIN });

        expect(res.status).toBe(200);
    });

    it("an OWNER role also passes an ADMIN requirement (hierarchy)", async () => {
        const ownerUser = await createUser();
        const targetUser = await createUser();
        const org = await createOrganization();
        await createMembership(ownerUser, org, OrganizationMemberRole.OWNER);
        const target = await createMembership(targetUser, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, ownerUser)
            .put(`/v1/tenant/${org.slug}/member/${target.uuid}`)
            .send({ role: OrganizationMemberRole.ADMIN });

        expect(res.status).toBe(200);
    });
});
