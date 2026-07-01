import {QuotaKey, QuotaPeriod, QuotaUnit} from "#shared/quota";

export interface Quota {
    uuid: string;
    key: QuotaKey;
    unit: QuotaUnit;
    defaultValue: number | null;
    period: QuotaPeriod | null;
    createdAt: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}
