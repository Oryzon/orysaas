import {
    BeforeInsert, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity, Index, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { OrganizationEntity } from "./organization.entity";
import { PlanPriceEntity } from "./plan-price.entity";
import { SubscriptionStatus } from "../../../shared/subscription-status";

@Entity()
@Index(['stripeSubscriptionId'], { unique: true })
export class SubscriptionEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    stripeSubscriptionId: string;

    @Column()
    stripeCustomerId: string;

    @Column()
    @Index()
    organizationUuid: string;

    @ManyToOne(() => OrganizationEntity, (organization) => organization.subscriptions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationUuid' })
    organization: OrganizationEntity;

    @Column()
    @Index()
    planPriceUuid: string;

    @ManyToOne(() => PlanPriceEntity, (planPrice) => planPrice.subscriptions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'planPriceUuid' })
    planPrice: PlanPriceEntity;

    @Column({ type: "enum", enum: SubscriptionStatus })
    status: SubscriptionStatus;

    @Column({ nullable: true })
    trialEndsAt: Date | null;

    @Column({ nullable: true })
    currentPeriodStart: Date | null;

    @Column({ nullable: true })
    currentPeriodEnd: Date | null;

    @Column({ nullable: true })
    canceledAt: Date | null;

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
}