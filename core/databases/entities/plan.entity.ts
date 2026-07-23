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
import { QuotaPlanEntity } from "./quota-plan.entity";
import { PlanPriceEntity } from "./plan-price.entity";

@Entity()
export class PlanEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    isActive: boolean;

    @Column({ default: false })
    isPopular: boolean;

    @Column()
    slug: string;

    @Column({ nullable: true })
    stripeProductId: string | null;

    @OneToMany(() => QuotaPlanEntity, (qp) => qp.plan)
    quotas: QuotaPlanEntity[];

    @OneToMany(() => PlanPriceEntity, (pp) => pp.plan)
    prices: PlanPriceEntity[];

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
