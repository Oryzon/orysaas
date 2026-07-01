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
import { NumericTransformer } from "../transformers/number.transformer";
import { QuotaPlanEntity } from "./quota-plan.entity";

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
    sellPrice: number;

    @Column()
    isActive: boolean;

    @Column()
    slug: string;

    @OneToMany(() => QuotaPlanEntity, (qp) => qp.plan)
    quotas: QuotaPlanEntity[];

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
