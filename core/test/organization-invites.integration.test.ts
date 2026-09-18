import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { Equal } from "typeorm";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createOrganization, createMembership, createInvite } from "./helpers/fixtures";
import { OrganizationMemberRole } from "../build/core/databases/entities/organization-member.entity";
import { OrganizationInviteRepository } from "../build/core/databases/repositories/organization-invite.repository";
import { OrganizationMemberRepository } from "../build/core/databases/repositories/organization-member.repository";

describe("[ Organization Invites ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("an ADMIN successfully invites a new email", async () => {
        const admin = await createUser();
        const org = await createOrganization();
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);

        const email = `invited-${Date.now()}@example.test`;

        const res = await authed(request, admin)
            .post(`/v1/tenant/${org.slug}/member/invite/`)
            .send({ email, role: OrganizationMemberRole.MEMBER });

        expect(res.status).toBe(200);

        const invite = await OrganizationInviteRepository.findOne({
            where: { organizationUuid: Equal(org.uuid), email: Equal(email) },
        });

        expect(invite).not.toBeNull();
    });

    it("inviting an email that's already a member is rejected (422)", async () => {
        const admin = await createUser();
        const existingMember = await createUser();
        const org = await createOrganization();
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);
        await createMembership(existingMember, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, admin)
            .post(`/v1/tenant/${org.slug}/member/invite/`)
            .send({ email: existingMember.email, role: OrganizationMemberRole.MEMBER });

        expect(res.status).toBe(422);
    });

    it("inviting the same email twice while pending is rejected (422)", async () => {
        const admin = await createUser();
        const org = await createOrganization();
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);

        const email = `pending-${Date.now()}@example.test`;
        await createInvite(org, email, OrganizationMemberRole.MEMBER);

        const res = await authed(request, admin)
            .post(`/v1/tenant/${org.slug}/member/invite/`)
            .send({ email, role: OrganizationMemberRole.MEMBER });

        expect(res.status).toBe(422);
    });

    it("a plain MEMBER cannot invite (422)", async () => {
        const member = await createUser();
        const org = await createOrganization();
        await createMembership(member, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, member)
            .post(`/v1/tenant/${org.slug}/member/invite/`)
            .send({ email: "someone@example.test", role: OrganizationMemberRole.MEMBER });

        expect(res.status).toBe(422);
    });

    it("accepting a valid invite creates the membership with the invite's role", async () => {
        const user = await createUser();
        const org = await createOrganization();
        const invite = await createInvite(org, "irrelevant@example.test", OrganizationMemberRole.ADMIN);

        const res = await authed(request, user).post(`/v1/tenant/${org.slug}/member/invite/accept/${invite.token}`);

        expect(res.status).toBe(200);

        const membership = await OrganizationMemberRepository.findOne({
            where: { organizationUuid: Equal(org.uuid), memberUuid: Equal(user.uuid) },
        });

        expect(membership?.role).toBe(OrganizationMemberRole.ADMIN);
    });

    it("accepting an already accepted invite is rejected (422)", async () => {
        const user = await createUser();
        const org = await createOrganization();
        const invite = await createInvite(org, "irrelevant@example.test", OrganizationMemberRole.MEMBER, {
            acceptedAt: new Date(),
        });

        const res = await authed(request, user).post(`/v1/tenant/${org.slug}/member/invite/accept/${invite.token}`);

        expect(res.status).toBe(422);
    });
});
