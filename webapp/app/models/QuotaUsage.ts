import { QuotaKey, QuotaPeriod, QuotaUnit } from "#shared/quota";

export interface QuotaUsage {
    key: QuotaKey;
    unit: QuotaUnit;
    period: QuotaPeriod | null;
    limit: number | null; // null = illimité sur ce plan
    used: number;
}
