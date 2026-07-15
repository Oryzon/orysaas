import type { QuotaPlan } from "./QuotaPlan";

export interface Plan {
    uuid?: string;
    title: string;
    description?: string;
    purchasePrice: number;
    sellPrice: number;
    isActive: boolean;
    isPopular: boolean;
    trialPeriod: number;
    quotas?: QuotaPlan[];
    uniqueKey?: string;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}
