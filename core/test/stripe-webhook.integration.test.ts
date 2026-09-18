import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import Stripe from "stripe";
import { buildTestApp } from "./helpers/request";
import { createOrganization, createPlanPrice, seedStripeApiKey } from "./helpers/fixtures";
import { SubscriptionRepository } from "../build/core/databases/repositories/subscription.repository";
import { Equal } from "typeorm";

function buildSignedSubscriptionUpdatedPayload(subscriptionId: string, organizationUuid: string, planPriceUuid: string) {
    const now = Math.floor(Date.now() / 1000);

    const stripeSubscription = {
        id: subscriptionId,
        object: "subscription",
        status: "active",
        customer: "cus_test_123",
        trial_end: null,
        metadata: { organizationUuid, planPriceUuid },
        items: {
            data: [
                {
                    current_period_start: now,
                    current_period_end: now + 30 * 24 * 60 * 60,
                    price: { id: "price_test_123", currency: "eur", unit_amount: 1000, recurring: { interval: "month" } },
                },
            ],
        },
    };

    const event = {
        id: `evt_test_${Math.random().toString(36).slice(2)}`,
        object: "event",
        type: "customer.subscription.updated",
        data: { object: stripeSubscription },
    };

    const payload = JSON.stringify(event);
    const signature = new Stripe("sk_test_dummy_key").webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });

    return { payload, signature };
}

describe("[ Stripe Webhook ]", () => {
    let app: Application;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    // afterEach truncates everything, including the Stripe key row.
    // Re-seed per test, not once in beforeAll.
    beforeEach(async () => {
        await seedStripeApiKey();
    });

    it("a validly signed event creates a SubscriptionEntity", async () => {
        const org = await createOrganization();
        const planPrice = await createPlanPrice();
        const subscriptionId = `sub_test_${Math.random().toString(36).slice(2)}`;

        const { payload, signature } = buildSignedSubscriptionUpdatedPayload(subscriptionId, org.uuid, planPrice.uuid);

        const res = await supertest(app)
            .post("/stripe/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", signature)
            .send(payload);

        expect(res.status).toBe(200);

        const subscriptions = await SubscriptionRepository.find({
            where: { stripeSubscriptionId: Equal(subscriptionId) },
        });

        expect(subscriptions).toHaveLength(1);
        expect(subscriptions[0].organizationUuid).toBe(org.uuid);
    });

    it("replaying the same event doesn't create a duplicate (upsert by stripeSubscriptionId)", async () => {
        const org = await createOrganization();
        const planPrice = await createPlanPrice();
        const subscriptionId = `sub_test_${Math.random().toString(36).slice(2)}`;

        const { payload, signature } = buildSignedSubscriptionUpdatedPayload(subscriptionId, org.uuid, planPrice.uuid);

        await supertest(app)
            .post("/stripe/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", signature)
            .send(payload);

        const res = await supertest(app)
            .post("/stripe/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", signature)
            .send(payload);

        expect(res.status).toBe(200);

        const subscriptions = await SubscriptionRepository.find({
            where: { stripeSubscriptionId: Equal(subscriptionId) },
        });

        expect(subscriptions).toHaveLength(1);
    });

    it("a missing signature returns 400 without writing to the database", async () => {
        const org = await createOrganization();
        const planPrice = await createPlanPrice();
        const subscriptionId = `sub_test_${Math.random().toString(36).slice(2)}`;

        const { payload } = buildSignedSubscriptionUpdatedPayload(subscriptionId, org.uuid, planPrice.uuid);

        const res = await supertest(app).post("/stripe/webhook").set("Content-Type", "application/json").send(payload);

        expect(res.status).toBe(400);

        const subscriptions = await SubscriptionRepository.find({
            where: { stripeSubscriptionId: Equal(subscriptionId) },
        });

        expect(subscriptions).toHaveLength(0);
    });

    it("an invalid signature returns 400 without writing to the database", async () => {
        const org = await createOrganization();
        const planPrice = await createPlanPrice();
        const subscriptionId = `sub_test_${Math.random().toString(36).slice(2)}`;

        const { payload } = buildSignedSubscriptionUpdatedPayload(subscriptionId, org.uuid, planPrice.uuid);

        const res = await supertest(app)
            .post("/stripe/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", "t=1,v1=invalid_signature")
            .send(payload);

        expect(res.status).toBe(400);

        const subscriptions = await SubscriptionRepository.find({
            where: { stripeSubscriptionId: Equal(subscriptionId) },
        });

        expect(subscriptions).toHaveLength(0);
    });
});
