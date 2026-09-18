import { LessThan } from "typeorm";
import { DateTime } from "luxon";
import { Cron } from "../decorators";
import { JobHistoryEntity } from "../databases/entities/job-history.entity";
import { JobHistoryRepository } from "../databases/repositories/job-history.repository";
import { QuotaUsageRepository } from "../databases/repositories/quota-usage.repository";

// each period has its own row (org/key/periodStart), so a new period just
// starts at 0 by itself, nothing to reset. this job only exists to clean up
// the old rows so the table doesn't grow forever
const RETENTION_DAYS = 90;

export class QuotaUsageCleanupJobs {
    @Cron("quota-usage-cleanup", "0 4 * * *")
    async run(log: JobHistoryEntity) {
        const cutoff = DateTime.now().minus({ days: RETENTION_DAYS }).toJSDate();

        const result = await QuotaUsageRepository.delete({
            periodEnd: LessThan(cutoff),
        });

        const deleted = result.affected ?? 0;

        await JobHistoryRepository.addLog(
            log.uuid,
            `${deleted} ligne(s) d'usage de quota supprimée(s) (période close depuis plus de ${RETENTION_DAYS} jours).`,
            "info",
        );

        return {
            success: true,
            input: { retentionDays: RETENTION_DAYS },
            output: { deleted },
        };
    }
}
