import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { Equal } from "typeorm";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createContact } from "./helpers/fixtures";
import { ContactRepository } from "../build/core/databases/repositories/contact.repository";

describe("[ Contact Form ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("a public submission (no auth) creates a contact", async () => {
        const email = `contact-${Date.now()}@example.test`;

        const res = await request.post("/v1/contact/").send({
            firstname: "Jean",
            lastname: "Dupont",
            email,
            subject: "Question",
            message: "Bonjour, j'ai une question sur votre produit.",
        });

        expect(res.status).toBe(200);

        const contact = await ContactRepository.findOne({ where: { email: Equal(email) } });
        expect(contact).not.toBeNull();
    });

    it("replying as a non SaaS-admin user is rejected (403)", async () => {
        const user = await createUser();
        const contact = await createContact();

        const res = await authed(request, user)
            .post(`/v1/contact/${contact.uuid}/reply`)
            .send({ message: "Merci pour votre message." });

        expect(res.status).toBe(403);
    });

    it("replying as a SaaS admin works", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const contact = await createContact();

        const res = await authed(request, admin)
            .post(`/v1/contact/${contact.uuid}/reply`)
            .send({ message: "Merci pour votre message." });

        expect(res.status).toBe(200);
    });

    it("archiving a contact removes it from the admin list", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const contact = await createContact();

        const archiveRes = await authed(request, admin).delete(`/v1/contact/${contact.uuid}`);
        expect(archiveRes.status).toBe(200);

        const listRes = await authed(request, admin).get("/v1/contacts/");
        expect(listRes.body.some((c: { uuid: string }) => c.uuid === contact.uuid)).toBe(false);
    });
});
