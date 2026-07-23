import {
    BeforeInsert, BeforeSoftRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity, Index, JoinColumn, ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { PlanEntity } from "./plan.entity";
import { NumericTransformer } from "../transformers/number.transformer";
import { BillingInterval } from "../../../shared/billing-interval";
import { SubscriptionEntity } from "./subscription.entity";

@Entity()
@Index(['planUuid', 'billingInterval', 'deletedAt'], { unique: true })
export class PlanPriceEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({ type: "enum", enum: BillingInterval })
    billingInterval: BillingInterval;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: new NumericTransformer(),
    })
    sellPrice: number;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: new NumericTransformer(),
    })
    purchasePrice: number;

    @Column({ default: 0 })
    trialPeriod: number; // In Day

    @Column({ nullable: true })
    stripePriceId: string | null;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    @Index()
    planUuid: string;

    @ManyToOne(() => PlanEntity, (plan) => plan.prices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'planUuid' })
    plan: PlanEntity;

    @OneToMany(() => SubscriptionEntity, (s) => s.planPrice)
    subscriptions: SubscriptionEntity[];

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