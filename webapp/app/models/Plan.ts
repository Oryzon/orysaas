import type { Quota } from "./Quota";

export interface Plan {
    uuid?: string;
    title: string;
    description?: string;
    purchasePrice: number;
    salePrice: number;
    isActive: boolean;
    quotas?: Quota[];
    uniqueKey?: string;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}
