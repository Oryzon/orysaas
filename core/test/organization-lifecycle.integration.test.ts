import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { Equal } from "typeorm";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createOrganization, createMembership } from "./helpers/fixtures";
import { OrganizationMemberRole } from "../build/core/databases/entities/organization-member.entity";
import { OrganizationMemberRepository } from "../build/core/databases/repositories/organization-member.repository";

describe("[ Organization Lifecycle ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("creating an organization automatically makes the creator OWNER", async () => {
        const user = await createUser();

        const res = await authed(request, user)
            .post("/v1/tenant/organizations/")
            .field("name", `Acme ${Date.now()}`)
            .field("address", "1 rue de Test")
            .field("postalCode", "75000")
            .field("city", "Paris")
            .field("country", "FR");

        expect(res.status).toBe(200);
        expect(res.body.entity.role).toBe(OrganizationMemberRole.OWNER);

        const membership = await OrganizationMemberRepository.findOne({
            where: {
                organizationUuid: Equal(res.body.entity.uuid),
                memberUuid: Equal(user.uuid),
            },
        });

        expect(membership?.role).toBe(OrganizationMemberRole.OWNER);
    });

    it("two organizations with the same name get distinct slugs", async () => {
        const user = await createUser();
        const name = `Duplicate Name ${Date.now()}`;

        const res1 = await authed(request, user)
            .post("/v1/tenant/organizations/")
            .field("name", name)
            .field("address", "1 rue de Test")
            .field("postalCode", "75000")
            .field("city", "Paris")
            .field("country", "FR");

        const res2 = await authed(request, user)
            .post("/v1/tenant/organizations/")
            .field("name", name)
            .field("address", "1 rue de Test")
            .field("postalCode", "75000")
            .field("city", "Paris")
            .field("country", "FR");

        expect(res1.body.entity.slug).not.toBe(res2.body.entity.slug);
        expect(res2.body.entity.slug).toBe(`${res1.body.entity.slug}_1`);
    });

    it("changing the owner's (OWNER) role is rejected (422)", async () => {
        const owner = await createUser();
        const admin = await createUser();
        const org = await createOrganization();
        const ownerMembership = await createMembership(owner, org, OrganizationMemberRole.OWNER);
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);

        const res = await authed(request, admin)
            .put(`/v1/tenant/${org.slug}/member/${ownerMembership.uuid}`)
            .send({ role: OrganizationMemberRole.MEMBER });

        expect(res.status).toBe(422);
    });

    it("removing the owner (OWNER) is rejected (403)", async () => {
        const owner = await createUser();
        const admin = await createUser();
        const org = await createOrganization();
        const ownerMembership = await createMembership(owner, org, OrganizationMemberRole.OWNER);
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);

        const res = await authed(request, admin).delete(`/v1/tenant/${org.slug}/member/${ownerMembership.uuid}`);

        expect(res.status).toBe(403);
    });

    it("creating an organization with a logo saves it and returns its URL", async () => {
        const user = await createUser();

        // 1x1 transparent PNG (small enough to inline, real enough for Jimp).
        const tinyPng = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            "base64",
        );

        const res = await authed(request, user)
            .post("/v1/tenant/organizations/")
            .field("name", `Acme Logo ${Date.now()}`)
            .field("address", "1 rue de Test")
            .field("postalCode", "75000")
            .field("city", "Paris")
            .field("country", "FR")
            .attach("logo", tinyPng, "logo.png");

        expect(res.status).toBe(200);
        expect(res.body.entity.logoUrl).toMatch(/\/uploads\/organizations\/.+\/logo\.jpg/);
    });

    it("an ADMIN can change a MEMBER's role, persisted in the database", async () => {
        const admin = await createUser();
        const member = await createUser();
        const org = await createOrganization();
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);
        const memberMembership = await createMembership(member, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, admin)
            .put(`/v1/tenant/${org.slug}/member/${memberMembership.uuid}`)
            .send({ role: OrganizationMemberRole.ADMIN });

        expect(res.status).toBe(200);

        const updated = await OrganizationMemberRepository.findOne({ where: { uuid: Equal(memberMembership.uuid) } });
        expect(updated?.role).toBe(OrganizationMemberRole.ADMIN);
    });
});
