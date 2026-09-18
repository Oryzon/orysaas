import { dataSource } from "../../config/datasource";
import { QuotaUsageEntity } from "../entities/quota-usage.entity";
import { Equal } from "typeorm";
import { QuotaKey } from "../../../shared/quota";

export const QuotaUsageRepository = dataSource.getRepository(QuotaUsageEntity).extend({
    async findCurrentPeriod(
        organizationUuid: string,
        quotaKey: QuotaKey,
        periodStart: Date,
    ): Promise<QuotaUsageEntity | null> {
        return this.findOne({
            where: {
                organizationUuid: Equal(organizationUuid),
                quotaKey: Equal(quotaKey),
                periodStart: Equal(periodStart),
            },
        });
    },
});
