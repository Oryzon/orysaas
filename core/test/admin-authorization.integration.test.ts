import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createOrganization } from "./helpers/fixtures";

describe("[ Platform Admin Routes ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("a non-admin user cannot list all organizations (403)", async () => {
        const user = await createUser();

        const res = await authed(request, user).get("/v1/organizations/");

        expect(res.status).toBe(403);
    });

    it("a SaaS admin can list all organizations (200)", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        await createOrganization();

        const res = await authed(request, admin).get("/v1/organizations/");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("a non-admin user cannot list all users (403)", async () => {
        const user = await createUser();

        const res = await authed(request, user).get("/v1/users/");

        expect(res.status).toBe(403);
    });

    it("a SaaS admin can list all users (200)", async () => {
        const admin = await createUser({ isSaasAdmin: true });

        const res = await authed(request, admin).get("/v1/users/");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("a non-admin user cannot fetch an arbitrary organization by slug (403)", async () => {
        const user = await createUser();
        const org = await createOrganization();

        const res = await authed(request, user).get(`/v1/organization/${org.slug}`);

        expect(res.status).toBe(403);
    });

    it("a SaaS admin can fetch an arbitrary organization by slug (200)", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const org = await createOrganization();

        const res = await authed(request, admin).get(`/v1/organization/${org.slug}`);

        expect(res.status).toBe(200);
        expect(res.body.slug).toBe(org.slug);
    });

    it("a non-admin user cannot fetch an arbitrary user by uuid (403)", async () => {
        const user = await createUser();
        const target = await createUser();

        const res = await authed(request, user).get(`/v1/user/${target.uuid}`);

        expect(res.status).toBe(403);
    });

    it("a SaaS admin can fetch an arbitrary user by uuid (200)", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const target = await createUser();

        const res = await authed(request, admin).get(`/v1/user/${target.uuid}`);

        expect(res.status).toBe(200);
        expect(res.body.uuid).toBe(target.uuid);
    });
});
