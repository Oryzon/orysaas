import type { Plan } from "./Plan";

export enum QuotaType {
    API_CALLS = "api_calls",
    STORAGE = "storage",
    USERS = "members",
    OTHER = "other",
}

export const QuotaTypeLabels: Record<QuotaType, string> = {
    [QuotaType.API_CALLS]: "Appels API",
    [QuotaType.STORAGE]: "Stockage",
    [QuotaType.USERS]: "Utilisateurs",
    [QuotaType.OTHER]: "Autre",
};

export interface Quota {
    uuid?: string;
    type: QuotaType;
    value: number;
    planUuid?: string;
    plan?: Plan;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}

export const defaultQuota = (): Quota => ({
    type: QuotaType.OTHER,
    value: 0,
});
