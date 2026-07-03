import type { Quota } from "./Quota";
import type { Plan } from "./Plan";

export interface QuotaPlan {
    uuid: string;
    quotaUuid: string;
    quota?: Quota;
    planUuid: string;
    plan?: Plan;
    value: number | null;
    createdAt: Date;
    createdBy?: string;
    updatedAt?: Date | null;
    updatedBy?: string | null;
    deletedAt?: Date | null;
    deletedBy?: string | null;
}