import type { PlanPrice } from "./PlanPrice";
import type { SubscriptionStatus } from "#shared/subscription-status";

export interface Subscription {
    uuid: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    organizationUuid: string;
    planPriceUuid: string;
    planPrice?: PlanPrice;
    status: SubscriptionStatus;
    trialEndsAt: Date | null;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    canceledAt: Date | null;
    createdAt: Date;
    createdBy?: string;
    updatedAt?: Date | null;
    updatedBy?: string | null;
}