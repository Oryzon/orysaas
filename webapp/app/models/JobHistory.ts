import type { JobSetting } from "~/models/JobSetting";

export enum JobHistoryStatus {
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
    RUNNING = 'RUNNING'
}

export interface JobHistory {
    uuid: string;
    jobUuid: string;
    job: JobSetting;
    status: JobHistoryStatus;
    duration: number;
    input: Record<string, any>;
    logs: Record<string, any>;
    output: Record<string, any>;
    createdAt: Date;
    createdBy: string;
}