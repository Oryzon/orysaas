import { Cron } from "../decorators";
import { DateTime } from "luxon";
import { JobHistoryRepository } from "../databases/repositories/job-history.repository";
import { JobHistoryEntity } from "../databases/entities/job-history.entity";

interface JobInput {
    from?: string;
    to?:   string;
}

export class AccountantBridgeJobs {
    //@Cron('accountant-bridge', '0 * * * *')
    async run(log: JobHistoryEntity, input: JobInput = {}) {
        const from = input.from ?? DateTime.now().minus({ month: 1 }).startOf('month').toJSDate();
        const to = input.to ?? DateTime.now().minus({ month: 1 }).endOf('month').toJSDate();
        
        return {
            success: true,
            input: {
                from,
                to
            },
            output: {
                toto: 'titi'
            }
        }
    }
}