import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createOrganization, createMembership, setupOrganizationWithQuota } from "./helpers/fixtures";
import { OrganizationMemberRole } from "../build/core/databases/entities/organization-member.entity";
import { QuotaKey, QuotaPeriod } from "../build/shared/quota";

describe("[ API Keys ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("an organization ADMIN can create an API key with a systemKey", async () => {
        const admin = await createUser();
        const org = await createOrganization();
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);

        const res = await authed(request, admin).post(`/v1/tenant/${org.slug}/setting/api-key/`).send({
            label: "My Sendgrid key",
            type: "INTEGRATION",
            value: "sk_test_dummy",
            systemKey: "SENDGRID",
        });

        expect(res.status).toBe(201);
    });

    it("a duplicate active systemKey for the same organization is rejected (409)", async () => {
        const admin = await createUser();
        const org = await createOrganization();
        await createMembership(admin, org, OrganizationMemberRole.ADMIN);

        const first = await authed(request, admin).post(`/v1/tenant/${org.slug}/setting/api-key/`).send({
            label: "Key 1",
            type: "INTEGRATION",
            value: "sk_test_1",
            systemKey: "TWILIO",
        });
        expect(first.status).toBe(201);

        const second = await authed(request, admin).post(`/v1/tenant/${org.slug}/setting/api-key/`).send({
            label: "Key 2",
            type: "INTEGRATION",
            value: "sk_test_2",
            systemKey: "TWILIO",
        });

        expect(second.status).toBe(409);
    });

    it("a plain MEMBER cannot create an API key (422)", async () => {
        const member = await createUser();
        const org = await createOrganization();
        await createMembership(member, org, OrganizationMemberRole.MEMBER);

        const res = await authed(request, member).post(`/v1/tenant/${org.slug}/setting/api-key/`).send({
            label: "Key",
            type: "INTEGRATION",
            value: "sk_test",
            systemKey: "AWS_S3",
        });

        expect(res.status).toBe(422);
    });

    it("a non SaaS-admin user cannot view global keys (403)", async () => {
        const user = await createUser();

        const res = await authed(request, user).get("/v1/settings/");

        expect(res.status).toBe(403);
    });

    it("creating a CONSUMER key is blocked once the API_KEYS quota is reached", async () => {
        const { organization } = await setupOrganizationWithQuota(QuotaKey.API_KEYS, QuotaPeriod.MONTHLY, 1);
        const admin = await createUser();
        await createMembership(admin, organization, OrganizationMemberRole.ADMIN);

        const first = await authed(request, admin).post(`/v1/tenant/${organization.slug}/setting/api-key/`).send({
            label: "Customer key 1",
            type: "CONSUMER",
        });
        expect(first.status).toBe(201);

        const second = await authed(request, admin).post(`/v1/tenant/${organization.slug}/setting/api-key/`).send({
            label: "Customer key 2",
            type: "CONSUMER",
        });

        expect(second.status).toBe(422);
    });
});
