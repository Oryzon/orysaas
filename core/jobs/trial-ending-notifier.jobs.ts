import { DateTime } from "luxon";
import { Cron } from "../decorators";
import { JobHistoryEntity } from "../databases/entities/job-history.entity";
import { JobHistoryRepository } from "../databases/repositories/job-history.repository";
import { SubscriptionRepository } from "../databases/repositories/subscription.repository";
import { emailOrganizationAdmins } from "../helpers/organization-notify.helper";

const DAYS_BEFORE_TRIAL_END = 3;

export class TrialEndingNotifierJobs {
    @Cron("trial-ending-notifier", "0 8 * * *")
    async run(log: JobHistoryEntity) {
        const now = DateTime.now();

        const subscriptions = await SubscriptionRepository.findTrialEndingSoon(
            now.toJSDate(),
            now.plus({ days: DAYS_BEFORE_TRIAL_END }).toJSDate(),
        );

        let notified = 0;

        for (const subscription of subscriptions) {
            await emailOrganizationAdmins(
                subscription.organizationUuid,
                "trial-ending",
                `Votre essai se termine bientôt`,
                {
                    organizationName: subscription.organization.name,
                    planTitle: subscription.planPrice.plan.title,
                    trialEndsAt: DateTime.fromJSDate(subscription.trialEndsAt!)
                        .setLocale("fr")
                        .toLocaleString(DateTime.DATE_FULL),
                    manageUrl: `${process.env.HTTP_URL}/portal/${subscription.organization.slug}/subscription`,
                },
            );

            subscription.trialEndingNotifiedAt = DateTime.now().toJSDate();
            await SubscriptionRepository.save(subscription);

            notified++;

            await JobHistoryRepository.addLog(
                log.uuid,
                `Rappel de fin d'essai envoyé pour "${subscription.organization.name}".`,
                "info",
            );
        }

        return {
            success: true,
            input: { daysBeforeTrialEnd: DAYS_BEFORE_TRIAL_END },
            output: { notified, total: subscriptions.length },
        };
    }
}
