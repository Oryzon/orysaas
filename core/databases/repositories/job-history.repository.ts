import { dataSource } from "../../config/datasource";
import { JobHistoryEntity, JobHistoryStatus } from "../entities/job-history.entity";
import { JobSettingEntity } from "../entities/job-setting.entity";

export const JobHistoryRepository = dataSource.getRepository(JobHistoryEntity).extend({
    async start(job: JobSettingEntity) {
        const log = new JobHistoryEntity();

        log.jobUuid = job.uuid;
        log.status = JobHistoryStatus.RUNNING;

        await this.insert(log);

        return log;
    },
    async finish(log: JobHistoryEntity, input: Record<string, any>, output: Record<string, any>) {
        log.status = JobHistoryStatus.SUCCESS;
        log.input = input ?? null;
        log.output = output ?? null;

        return log;
    },
    async fail(log: JobHistoryEntity, input: Record<string, any>, output: Record<string, any>) {
        log.status = JobHistoryStatus.FAIL;
        log.input = input ?? null;
        log.output = output ?? null;

        return log;
    },
    async addLog(uuid: string, message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
        const history = await this.findOneOrFail({ where: { uuid } });

        history.logs = [
            ...history.logs ?? [],
            {
                timestamp: new Date().toISOString(),
                message,
                level,
            }
        ];

        await this.save(history);
    }
});