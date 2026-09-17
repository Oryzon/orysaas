import { dataSource } from "../../config/datasource";
import { SubscriptionEntity } from "../entities/subscription.entity";
import { Between, Equal, In, IsNull } from "typeorm";
import { SubscriptionStatus } from "../../../shared/subscription-status";

export const SubscriptionRepository = dataSource.getRepository(SubscriptionEntity).extend({
    async findActiveByOrganization(organizationUuid: string): Promise<SubscriptionEntity | null> {
        return this.findOne({
            where: {
                organizationUuid: Equal(organizationUuid),
                status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE]),
            },
            relations: {
                planPrice: {
                    plan: true,
                },
            },
            order: {
                createdAt: "DESC",
            },
        });
    },

    async findTrialEndingSoon(from: Date, to: Date): Promise<SubscriptionEntity[]> {
        return this.find({
            where: {
                status: Equal(SubscriptionStatus.TRIALING),
                trialEndsAt: Between(from, to),
                trialEndingNotifiedAt: IsNull(),
            },
            relations: {
                planPrice: {
                    plan: true,
                },
                organization: true,
            },
        });
    },
});
