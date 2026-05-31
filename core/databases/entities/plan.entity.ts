import {
    BeforeInsert,
    BeforeSoftRemove,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { QuotaEntity } from "./quota.entity";
import { NumericTransformer } from "../transformers/number.transformer";

@Entity()
export class PlanEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: new NumericTransformer(),
    })
    purchasePrice: number;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: new NumericTransformer(),
    })
    salePrice: number;

    @Column()
    isActive: boolean;

    @Column()
    slug: string;

    @OneToMany(() => QuotaEntity, (quota) => quota.plan, {
        cascade: ["insert", "update"],
        orphanedRowAction: "delete",
    })
    quotas: QuotaEntity[];

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdBy: string;

    @Column({ nullable: true })
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true })
    @DeleteDateColumn()
    deletedAt: Date;

    @Column({ nullable: true })
    deletedBy: string;

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
        this.isActive = false;
        this.deletedAt = DateTime.now().toJSDate();
        this.deletedBy = getUserUuid();
    }
}
