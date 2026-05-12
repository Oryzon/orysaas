import { CronJobMeta } from "../decorators";
import { JobSettingEntity } from "../databases/entities/job-setting.entity";
import { discover } from "./discover";
import { JobSettingRepository } from "../databases/repositories/job-setting.repository";
import { Equal } from "typeorm";
import { schedule } from "node-cron";
import { JobHistoryRepository } from "../databases/repositories/job-history.repository";
import { JobHistoryStatus } from "../databases/entities/job-history.entity";

interface RegisteredJobs {
    instance: any,
    meta: CronJobMeta,
    setting: JobSettingEntity,
    task?: any
}

class RunnerClass {
    private jobs = new Map<string, RegisteredJobs>;

    async init() {
        const discovered = await discover();

        for (const { instance, meta } of discovered) {
            await this.register(instance, meta);
        }

        console.log('[Runner] Jobs planifié(s).')
    }

    private async register(instance: any, meta: CronJobMeta) {
        let setting = await JobSettingRepository.findOne({
            where: {
                name: Equal(meta.name)
            }
        });

        if (!setting) { // The job don't exist ? Create it.
            setting = new JobSettingEntity();

            setting.name = meta.name;
            setting.createdBy = process.env.UUID_SYSTEM;
        }

        // We force update of the field because well maybe the dev have made some shit, and readjust the expression. (onyl if the user haven't update)
        if (setting.updatedBy === process.env.UUID_SYSTEM || setting.updatedBy === null) {
            setting.expression = meta.expression;
        }

        await JobSettingRepository.save(setting);

        // Know, register the schedule.
        let job: RegisteredJobs = { instance, meta, setting }
        this.jobs.set(meta.name, job);
        this.schedule(job);
    }

    private schedule(job: RegisteredJobs) {
        const expression = job.setting.expression ?? job.meta.expression;

        if (job.setting.isEnabled) {
            job.task = schedule(expression, async () => {
                await this.execute(job);
            });
        }
    }

    public async execute(job: RegisteredJobs, input: Record<string, any> = {}) {
        let alreadyRunning = await JobHistoryRepository.findOne({
            where: {
                jobUuid: Equal(job.setting.uuid),
                status: Equal(JobHistoryStatus.RUNNING)
            }
        });

        if (alreadyRunning) {
            return;
        }

        let log = await JobHistoryRepository.start(job.setting);
        const startedAt = Date.now();

        try {
            const result = await job.instance[job.meta.handlerName](log, input);

            log = await JobHistoryRepository.finish(log, result.input, result.output);
        } catch (error) {
            log = await JobHistoryRepository.fail(log, error.input, error.output);
        } finally {
            log.duration = Date.now() - startedAt;
            await JobHistoryRepository.save(log);
        }
    }

    async reload(name: string, data: { expression?: string; isEnabled?: boolean }) {
        // Need to had reload after admin update, but will be later
        const job = this.jobs.get(name);

        if (!job) {
            throw new Error(`[Runner] Job "${name}" introuvable.`);
        }

        // Stop the current task if running
        if (job.task) {
            job.task.stop();
            job.task = undefined;
        }

        job.setting.expression = data.expression;
        job.setting.isEnabled = data.isEnabled;

        this.schedule(job);

        console.log(`[Runner] Job "${name}" rechargé.`);
    }

    list(): RegisteredJobs[] {
        return Array.from(this.jobs.values());
    }

    public get(name: string): RegisteredJobs | undefined {
        return this.jobs.get(name);
    }
}

export const Runner = new RunnerClass();