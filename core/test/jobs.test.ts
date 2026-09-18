import { describe, it, expect } from "vitest";
import { Equal } from "typeorm";
import {
    createOrganization,
    createPlanPrice,
    createSubscription,
    createJobHistoryLog,
    createQuotaUsage,
} from "./helpers/fixtures";
import { QuotaUsageCleanupJobs } from "../build/core/jobs/quota-usage-cleanup.jobs";
import { TrialEndingNotifierJobs } from "../build/core/jobs/trial-ending-notifier.jobs";
import { QuotaUsageRepository } from "../build/core/databases/repositories/quota-usage.repository";
import { SubscriptionRepository } from "../build/core/databases/repositories/subscription.repository";
import { SubscriptionStatus } from "../build/shared/subscription-status";
import { QuotaKey } from "../build/shared/quota";

describe("[ Cron Jobs ]", () => {
    it("quota-usage-cleanup deletes quota usage rows whose period closed more than 90 days ago", async () => {
        const org = await createOrganization();
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        const old = await createQuotaUsage(
            org,
            QuotaKey.API_CALLS,
            new Date(now - 130 * day),
            new Date(now - 100 * day),
        );
        const recent = await createQuotaUsage(
            org,
            QuotaKey.EMAILS_SENT,
            new Date(now - 20 * day),
            new Date(now - 10 * day),
        );

        const log = await createJobHistoryLog();
        const result = await new QuotaUsageCleanupJobs().run(log);

        expect(result.success).toBe(true);
        expect(result.output.deleted).toBeGreaterThanOrEqual(1);

        const oldStill = await QuotaUsageRepository.findOne({ where: { uuid: Equal(old.uuid) } });
        const recentStill = await QuotaUsageRepository.findOne({ where: { uuid: Equal(recent.uuid) } });

        expect(oldStill).toBeNull();
        expect(recentStill).not.toBeNull();
    });

    it("trial-ending-notifier notifies trials ending within 3 days, not the others", async () => {
        const orgEnding = await createOrganization();
        const planPriceEnding = await createPlanPrice();
        const subscriptionEnding = await createSubscription(orgEnding, planPriceEnding, {
            status: SubscriptionStatus.TRIALING,
            trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        });

        const orgFar = await createOrganization();
        const planPriceFar = await createPlanPrice();
        const subscriptionFar = await createSubscription(orgFar, planPriceFar, {
            status: SubscriptionStatus.TRIALING,
            trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        });

        const log = await createJobHistoryLog();
        const result = await new TrialEndingNotifierJobs().run(log);

        expect(result.success).toBe(true);
        expect(result.output.notified).toBeGreaterThanOrEqual(1);

        const updatedEnding = await SubscriptionRepository.findOne({
            where: { uuid: Equal(subscriptionEnding.uuid) },
        });
        const updatedFar = await SubscriptionRepository.findOne({ where: { uuid: Equal(subscriptionFar.uuid) } });

        expect(updatedEnding?.trialEndingNotifiedAt).not.toBeNull();
        expect(updatedFar?.trialEndingNotifiedAt).toBeNull();
    });
});
