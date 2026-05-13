import { CheckJwt, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import { JobSettingRepository } from "../../../databases/repositories/job-setting.repository";
import { Runner } from "../../../jobs/runner";
import HttpCode from "../../../config/http-code";

@Controller('jobs')
export default class JobsController {
    @Get('/')
    @CheckJwt()
    @Error()
    async list(req: Request, res: Response) {
        let jobs = await JobSettingRepository.find({
            order: {
                name: 'DESC'
            }
        });

        let jobsRegistered = Runner.list();

        let result = jobs.map(job => {
            const registered = jobsRegistered.find(r => r.meta.name === job.name);

            return {
                uuid: job.uuid,
                name: job.name,
                expression: job.expression,
                isEnabled: job.isEnabled,
                isRegistered: !!registered,
            };
        });

        return res.status(HttpCode.OK).send(result);
    }
}