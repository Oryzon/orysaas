import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createPlan } from "./helpers/fixtures";
import { BillingInterval } from "../build/shared/billing-interval";

describe("[ Plans & Prices Admin ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("a non-admin user cannot list plans (403)", async () => {
        const user = await createUser();

        const res = await authed(request, user).get("/v1/plans/");

        expect(res.status).toBe(403);
    });

    it("a SaaS admin can create a plan", async () => {
        const admin = await createUser({ isSaasAdmin: true });

        const res = await authed(request, admin).post("/v1/plan/").send({
            title: "Plan de test",
            description: "Un plan pour les tests",
            isActive: true,
            isPopular: false,
        });

        expect(res.status).toBe(201);
        expect(res.body.entity.uuid).toBeDefined();
    });

    it("creating a price without required fields returns 400", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const plan = await createPlan();

        const res = await authed(request, admin).post(`/v1/plan/${plan.uuid}/price/`).send({});

        expect(res.status).toBe(400);
    });

    it("creating a 2nd price with the same billing interval on the same plan is rejected (409)", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const plan = await createPlan();

        const first = await authed(request, admin).post(`/v1/plan/${plan.uuid}/price/`).send({
            billingInterval: BillingInterval.MONTH,
            sellPrice: 10,
            purchasePrice: 5,
        });
        expect(first.status).toBe(201);

        const second = await authed(request, admin).post(`/v1/plan/${plan.uuid}/price/`).send({
            billingInterval: BillingInterval.MONTH,
            sellPrice: 15,
            purchasePrice: 7,
        });

        expect(second.status).toBe(409);
    });

    it("after deleting the first price, recreating one with the same billing interval succeeds", async () => {
        const admin = await createUser({ isSaasAdmin: true });
        const plan = await createPlan();

        const first = await authed(request, admin).post(`/v1/plan/${plan.uuid}/price/`).send({
            billingInterval: BillingInterval.MONTH,
            sellPrice: 10,
            purchasePrice: 5,
        });
        expect(first.status).toBe(201);

        const deleteRes = await authed(request, admin).delete(
            `/v1/plan/${plan.uuid}/price/${first.body.entity.uuid}`,
        );
        expect(deleteRes.status).toBe(200);

        const recreated = await authed(request, admin).post(`/v1/plan/${plan.uuid}/price/`).send({
            billingInterval: BillingInterval.MONTH,
            sellPrice: 12,
            purchasePrice: 6,
        });

        expect(recreated.status).toBe(201);
    });
});
