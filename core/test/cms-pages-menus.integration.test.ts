import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createPage, createMenu } from "./helpers/fixtures";

describe("[ CMS Pages & Menus ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("a public page with an unknown slug returns 200 with an empty body (not 404)", async () => {
        const res = await request.get("/v1/page/slug/ce-slug-n-existe-pas");

        // Controller does res.send(page) with page = null.
        // Express sends an empty body for that, not a JSON "null".
        expect(res.status).toBe(200);
        expect(res.text).toBe("");
    });

    it("a non-admin user cannot delete a page (403)", async () => {
        const user = await createUser();
        const page = await createPage();

        const res = await authed(request, user).delete(`/v1/page/${page.uuid}`);

        expect(res.status).toBe(403);
    });

    it("a SaaS admin deletes a page, which disappears from the admin list", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const page = await createPage();

        const deleteRes = await authed(request, admin).delete(`/v1/page/${page.uuid}`);
        expect(deleteRes.status).toBe(200);

        const listRes = await authed(request, admin).get("/v1/pages/");
        expect(listRes.body.some((p: { uuid: string }) => p.uuid === page.uuid)).toBe(false);
    });

    it("an inactive menu is excluded from the public bootstrap", async () => {
        await createMenu({ key: "header", isActive: false });

        const res = await request.get("/v1/public/");

        expect(res.status).toBe(200);
        expect(res.body.menus.header).toBeNull();
    });
});
