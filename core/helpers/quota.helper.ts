import { DateTime } from "luxon";
import { Equal } from "typeorm";
import { QuotaKey, QuotaPeriod, QuotaUnit } from "../../shared/quota";
import { SubscriptionRepository } from "../databases/repositories/subscription.repository";
import { QuotaPlanRepository } from "../databases/repositories/quota-plan.repository";
import { QuotaUsageRepository } from "../databases/repositories/quota-usage.repository";
import { QuotaRepository } from "../databases/repositories/quota.repository";
import { QuotaUsageEntity } from "../databases/entities/quota-usage.entity";
import { ApiKeyRepository } from "../databases/repositories/api-key.repository";
import { ApiKeyType } from "../databases/entities/api-key.entity";
import HttpCode from "../config/http-code";
import Messages from "../config/messages";

type QuotaStrategy = "live" | "incremental";

// API_KEYS is an example of a capacity quota, basically "how many active keys
// does the org have right now". checked live on the real data so it can never
// go out of sync. add your keys here the same way when you need a
// "you have N of X right now" type of limit.
//
// only INTEGRATION keys count here btw, CONSUMER keys are the ones the org
// gives to its own customers so those stay unlimited
const QUOTA_STRATEGY: Partial<Record<QuotaKey, QuotaStrategy>> = {
    [QuotaKey.API_KEYS]: "live",
};

const LIVE_QUOTA_COUNTERS: Partial<Record<QuotaKey, (organizationUuid: string) => Promise<number>>> = {
    [QuotaKey.API_KEYS]: (organizationUuid) =>
        ApiKeyRepository.count({
            where: { organizationUuid: Equal(organizationUuid), type: Equal(ApiKeyType.CONSUMER) },
        }),
};

function getPeriodBounds(period: QuotaPeriod): { start: Date; end: Date } {
    const now = DateTime.now();

    switch (period) {
        case QuotaPeriod.HOURLY:
            return { start: now.startOf("hour").toJSDate(), end: now.endOf("hour").toJSDate() };
        case QuotaPeriod.DAILY:
            return { start: now.startOf("day").toJSDate(), end: now.endOf("day").toJSDate() };
        case QuotaPeriod.WEEKLY:
            return { start: now.startOf("week").toJSDate(), end: now.endOf("week").toJSDate() };
        case QuotaPeriod.MONTHLY:
            return { start: now.startOf("month").toJSDate(), end: now.endOf("month").toJSDate() };
        case QuotaPeriod.YEARLY:
            return { start: now.startOf("year").toJSDate(), end: now.endOf("year").toJSDate() };
        case QuotaPeriod.LIFETIME:
        default:
            return { start: new Date(0), end: DateTime.fromMillis(8640000000000000).toJSDate() };
    }
}

interface QuotaResolution {
    hasSubscription: boolean;
    limit: number | null;
    period: QuotaPeriod | null;
}

async function resolveQuota(organizationUuid: string, key: QuotaKey): Promise<QuotaResolution> {
    const subscription = await SubscriptionRepository.findActiveByOrganization(organizationUuid);

    if (!subscription) {
        return {
            hasSubscription: false,
            limit: null,
            period: null,
        };
    }

    const quotaPlan = await QuotaPlanRepository.findOne({
        where: {
            planUuid: Equal(subscription.planPrice.planUuid),
            quota: {
                key: Equal(key),
            },
        },
        relations: {
            quota: true,
        },
    });

    if (!quotaPlan) {
        // The quota isn't in the plan ? So infini use possible.
        return {
            hasSubscription: true,
            limit: null,
            period: null,
        };
    }

    return {
        hasSubscription: true,
        limit: quotaPlan.value ?? quotaPlan.quota.defaultValue,
        period: quotaPlan.quota.period,
    };
}

async function getCurrentUsage(organizationUuid: string, key: QuotaKey, period: QuotaPeriod | null): Promise<number> {
    const strategy = QUOTA_STRATEGY[key] ?? "incremental";

    if (strategy === "live") {
        const countLive = LIVE_QUOTA_COUNTERS[key];
        return countLive ? countLive(organizationUuid) : 0;
    }

    if (!period) {
        return 0;
    }

    const { start } = getPeriodBounds(period);
    const usage = await QuotaUsageRepository.findCurrentPeriod(organizationUuid, key, start);

    return usage?.value ?? 0;
}

export interface QuotaCheckResult {
    allowed: boolean;
    message?: string;
}

export async function checkQuota(organizationUuid: string, key: QuotaKey): Promise<QuotaCheckResult> {
    const { hasSubscription, limit, period } = await resolveQuota(organizationUuid, key);

    if (!hasSubscription) {
        return {
            allowed: false,
            message: Messages.QUOTA_NO_SUBSCRIPTION,
        };
    }

    if (limit === null) {
        return { allowed: true };
    }

    const usage = await getCurrentUsage(organizationUuid, key, period);

    return usage < limit ? { allowed: true } : { allowed: false, message: Messages.QUOTA_EXCEEDED };
}

// both @CheckQuota and any manual checkQuota() call use this, so they always
// return the same status for the same reason
export function quotaErrorStatus(result: QuotaCheckResult): number {
    return result.message === Messages.QUOTA_NO_SUBSCRIPTION ? HttpCode.PAYMENT_REQUIRED : HttpCode.TOO_MANY_REQUESTS;
}

export interface QuotaUsageSummaryItem {
    key: QuotaKey;
    unit: QuotaUnit;
    period: QuotaPeriod | null;
    limit: number | null; // null = illimité sur ce plan
    used: number;
}

// grabs every quota from the org's current plan along with how much is used,
// basically for the gauges on the portal. no subscription = nothing to return
export async function getUsageSummary(organizationUuid: string): Promise<QuotaUsageSummaryItem[]> {
    const subscription = await SubscriptionRepository.findActiveByOrganization(organizationUuid);

    if (!subscription) {
        return [];
    }

    const quotaPlans = await QuotaPlanRepository.find({
        where: {
            planUuid: Equal(subscription.planPrice.planUuid),
        },
        relations: {
            quota: true,
        },
    });

    return Promise.all(
        quotaPlans.map(async (quotaPlan) => {
            const limit = quotaPlan.value ?? quotaPlan.quota.defaultValue;
            const period = quotaPlan.quota.period;
            const used = await getCurrentUsage(organizationUuid, quotaPlan.quota.key, period);

            return {
                key: quotaPlan.quota.key,
                unit: quotaPlan.quota.unit,
                period,
                limit,
                used,
            };
        }),
    );
}

// --- incremental quotas: "N times per period" (api calls, exports, emails sent...) ---
//
// these count something that just happened, not something you already have
// (unlike the capacity ones above). nothing in the boilerplate uses this yet
// so there's no real example, but here's the pattern for when you need one:
//
//   1. set the key's period on its QuotaEntity from the admin (MONTHLY etc),
//      don't put it in QUOTA_STRATEGY/LIVE_QUOTA_COUNTERS above, defaults to
//      incremental anyway
//   2. add `@CheckQuota(QuotaKey.YOUR_KEY)` right after @CheckOrganizationMember()
//   3. once the action actually worked, call
//      `await incrementUsage(organization.uuid, QuotaKey.YOUR_KEY);`
//
// @CheckQuota never calls incrementUsage itself btw, it only checks. that's
// on purpose, we only want to count what really happened, not what was just
// attempted

export async function incrementUsage(organizationUuid: string, key: QuotaKey, amount: number = 1): Promise<void> {
    if ((QUOTA_STRATEGY[key] ?? "incremental") === "live") {
        return;
    }

    const quota = await QuotaRepository.findOne({ where: { key: Equal(key) } });

    if (!quota?.period) {
        return;
    }

    const { start, end } = getPeriodBounds(quota.period);
    const existing = await QuotaUsageRepository.findCurrentPeriod(organizationUuid, key, start);

    if (existing) {
        await QuotaUsageRepository.increment({ uuid: existing.uuid }, "value", amount);
        return;
    }

    const usage = new QuotaUsageEntity();

    usage.organizationUuid = organizationUuid;
    usage.quotaKey = key;
    usage.periodStart = start;
    usage.periodEnd = end;
    usage.value = amount;

    try {
        await QuotaUsageRepository.insert(usage);
    } catch (error) {
        await QuotaUsageRepository.increment(
            {
                organizationUuid: Equal(organizationUuid),
                quotaKey: Equal(key),
                periodStart: Equal(start),
            },
            "value",
            amount,
        );
    }
}
