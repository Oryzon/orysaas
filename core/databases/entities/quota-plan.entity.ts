import {
    BeforeInsert, BeforeSoftRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity, Index, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { QuotaEntity } from "./quota.entity";
import { PlanEntity } from "./plan.entity";
import { NumericTransformer } from "../transformers/number.transformer";

@Entity()
@Index(['quotaUuid', 'planUuid', 'deletedAt'], { unique: true })
export class QuotaPlanEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    @Index()
    quotaUuid: string;

    @ManyToOne(() => QuotaEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quotaUuid' })
    quota: QuotaEntity;

    @Column()
    @Index()
    planUuid: string;

    @ManyToOne(() => PlanEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'planUuid' })
    plan: PlanEntity;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new NumericTransformer(),
    })
    value: number | null;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdBy: string;

    @Column({ nullable: true })
    @UpdateDateColumn()
    updatedAt: Date | null;

    @Column({ nullable: true })
    updatedBy: string | null;

    @Column({ nullable: true })
    @DeleteDateColumn()
    deletedAt: Date | null;

    @Column({ nullable: true })
    deletedBy: string | null;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = DateTime.now().toJSDate();
        this.createdBy = getUserUuid();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = DateTime.now().toJSDate();
        this.updatedBy = getUserUuid();
    }

    @BeforeSoftRemove()
    setDeletedAt() {
        this.deletedAt = DateTime.now().toJSDate();
        this.deletedBy = getUserUuid();
    }
}