import {
    BeforeInsert,
    BeforeSoftRemove,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { JobSettingEntity } from "./job-setting.entity";

export enum JobHistoryStatus {
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
    RUNNING = 'RUNNING'
}

@Entity()
export class JobHistoryEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    jobUuid: string;

    @ManyToOne(() => JobSettingEntity)
    job: JobSettingEntity;

    @Column({ type: 'enum', enum: JobHistoryStatus, default: JobHistoryStatus.RUNNING })
    status: JobHistoryStatus;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true, type: 'json' })
    input: Record<string, any>;

    @Column({ nullable: true, type: 'json' })
    logs: Array<{
        timestamp: string;
        message: string;
        level: 'info' | 'warn' | 'error';
    }>;

    @Column({ nullable: true, type: 'json' })
    output: Record<string, any>;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdBy: string;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = DateTime.now().toJSDate();
        this.createdBy = getUserUuid();
    }
}