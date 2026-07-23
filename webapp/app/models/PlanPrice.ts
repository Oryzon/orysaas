import type { Plan } from "./Plan";
import type { BillingInterval } from "#shared/billing-interval";

export interface PlanPrice {
    uuid: string;
    billingInterval: BillingInterval;
    sellPrice: number;
    purchasePrice: number;
    trialPeriod: number;
    stripePriceId?: string | null;
    isActive: boolean;
    discount?: number | null;
    planUuid: string;
    plan?: Plan;
    createdAt: Date;
    createdBy?: string;
    updatedAt?: Date | null;
    updatedBy?: string | null;
    deletedAt?: Date | null;
    deletedBy?: string | null;
}