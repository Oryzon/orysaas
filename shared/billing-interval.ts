export enum BillingInterval {
    MONTH = 'month',
    YEAR  = 'year',
}

export const BillingIntervalLabel: Record<BillingInterval, string> = {
    [BillingInterval.MONTH]: "Mensuel",
    [BillingInterval.YEAR]: "Annuel",
}