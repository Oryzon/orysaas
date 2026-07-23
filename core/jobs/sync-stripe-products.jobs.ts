import { Cron } from "../decorators";
import { JobHistoryEntity } from "../databases/entities/job-history.entity";
import { JobHistoryRepository } from "../databases/repositories/job-history.repository";
import { PlanRepository } from "../databases/repositories/plan.repository";
import { getStripeClient, syncPlan } from "../helpers/stripe.helper";

export class SyncStripeProductsJobs {
    @Cron('sync-stripe-products', '0 3 * * *')
    async run(log: JobHistoryEntity) {
        let stripe;

        try {
            stripe = await getStripeClient();
        } catch (error) {
            await JobHistoryRepository.addLog(
                log.uuid,
                (error as Error).message,
                'error'
            );

            throw error;
        }

        const plans = await PlanRepository.find();

        let synced = 0;
        let failed = 0;

        for (const plan of plans) {
            try {
                await syncPlan(stripe, plan);

                synced++;

                await JobHistoryRepository.addLog(
                    log.uuid,
                    `Plan "${plan.title}" synchronisé.`,
                    'info'
                );
            } catch (error) {
                failed++;

                await JobHistoryRepository.addLog(
                    log.uuid,
                    `Plan "${plan.title}" en échec : ${(error as Error).message}`,
                    'error'
                );
            }
        }

        return {
            success: true,
            input: {},
            output: { synced, failed, total: plans.length },
        };
    }
}