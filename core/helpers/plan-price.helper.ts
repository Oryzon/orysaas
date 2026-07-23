import { PlanPriceEntity } from "../databases/entities/plan-price.entity";
import { BillingInterval } from "../../shared/billing-interval";

const MONTHS_PER_INTERVAL: Record<BillingInterval, number> = {
    [BillingInterval.MONTH]: 1,
    [BillingInterval.YEAR]: 12,
};

export type PlanPriceWithDiscount = Omit<PlanPriceEntity, 'setCreatedAt' | 'setUpdatedAt' | 'setDeletedAt'> & { discount: number | null };

export const attachPlanPriceDiscounts = (prices: PlanPriceEntity[]): PlanPriceWithDiscount[] => {
    const monthly = prices.find((price) => price.billingInterval === BillingInterval.MONTH);

    return prices.map((price) => {
        if (!monthly || price.billingInterval === BillingInterval.MONTH || !monthly.sellPrice) {
            return { ...price, discount: null };
        }

        const referencePrice = monthly.sellPrice * MONTHS_PER_INTERVAL[price.billingInterval];
        const discount = Math.round((1 - price.sellPrice / referencePrice) * 100);

        return { ...price, discount: discount > 0 ? discount : null };
    });
};