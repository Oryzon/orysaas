import {
    BeforeInsert,
    BeforeSoftRemove,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { QuotaKey, QuotaPeriod, QuotaUnit } from "../../../shared/quota";
import { NumericTransformer } from "../transformers/number.transformer";
import { QuotaPlanEntity } from "./quota-plan.entity";

@Entity()
@Index(["key", "period"], { unique: true })
export class QuotaEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    key: QuotaKey;

    @Column()
    unit: QuotaUnit;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new NumericTransformer(),
    })
    defaultValue: number | null;

    @Column({ type: "enum", enum: QuotaPeriod, nullable: true })
    period: QuotaPeriod | null;

    @OneToMany(() => QuotaPlanEntity, (qp) => qp.quota)
    quotaPlans: QuotaPlanEntity[];

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
