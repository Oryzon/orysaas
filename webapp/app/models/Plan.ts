import type { QuotaPlan } from "./QuotaPlan";
import type { PlanPrice } from "./PlanPrice";

export interface Plan {
    uuid?: string;
    title: string;
    description?: string;
    isActive: boolean;
    isPopular: boolean;
    stripeProductId?: string | null;
    quotas?: QuotaPlan[];
    prices?: PlanPrice[];
    uniqueKey?: string;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}
