import { Controller, Get, Put, Error, CheckJwt, Post } from "../../../decorators";
import { Request, Response } from "express";
import { JobSettingRepository } from "../../../databases/repositories/job-setting.repository";
import { Equal } from "typeorm";
import { Runner } from "../../../jobs/runner";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";
import { JobHistoryRepository } from "../../../databases/repositories/job-history.repository";
import { JobHistoryEntity } from "../../../databases/entities/job-history.entity";

@Controller('job')
export default class JobController {
    @Get('/:uuid/histories')
    @CheckJwt()
    @Error()
    async listHistory(req: Request, res: Response){
        let uuidJob = req.params.uuid;

        let histories = await JobHistoryRepository.find({
            where: {
                jobUuid: Equal(uuidJob)
            },
            order: {
                createdAt: 'DESC'
            },
            take: 30
        });

        return res.status(HttpCode.OK).send(histories);
    }

    @Put('/:uuid')
    @CheckJwt()
    @Error()
    async update(req: Request, res: Response) {
        let uuid = req.params.uuid;

        let {
            expression,
            isEnabled
        } = req.body;

        let job = await JobSettingRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            }
        });

        if (expression) {
            job.expression = expression;
        }

        job.isEnabled = isEnabled;

        await JobSettingRepository.save(job);
        await Runner.reload(job.name, { expression: job.expression, isEnabled: job.isEnabled });

        return res.status(HttpCode.OK).send({
            message: Messages.JOB_UPDATED,
            entity: job,
        });
    }

    @Get('/:uuid/last-run')
    @CheckJwt()
    @Error()
    async getLastRun(req: Request, res: Response) {
        let uuidJob = req.params.uuid;

        const lastRun = await JobHistoryRepository.findOne({
            where: {
                jobUuid: Equal(uuidJob)
            },
            order: {
                createdAt: 'DESC'
            }
        });

        if (lastRun) {
            return res.status(HttpCode.OK).send(lastRun)
        }

        // No last run ? so give empty
        return res.status(HttpCode.OK).send(new JobHistoryEntity());
    }

    @Post('/:uuid/run')
    @CheckJwt()
    @Error()
    async run(req: Request, res: Response) {
        let uuidJob = req.params.uuid;

        let job = await JobSettingRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidJob)
            }
        });

        let registeredJobs = Runner.get(job.name);

        Runner.execute(registeredJobs, req.body);

        return res.status(HttpCode.OK).send({
            message: Messages.JOB_RUNNED
        });
    }
}