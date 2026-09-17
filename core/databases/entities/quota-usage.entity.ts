import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { OrganizationEntity } from "./organization.entity";
import { QuotaKey } from "../../../shared/quota";

@Entity()
@Index(["organizationUuid", "quotaKey", "periodStart"], { unique: true })
export class QuotaUsageEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    @Index()
    organizationUuid: string;

    @ManyToOne(() => OrganizationEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "organizationUuid" })
    organization: OrganizationEntity;

    @Column()
    quotaKey: QuotaKey;

    @Column({ default: 0 })
    value: number;

    @Column()
    periodStart: Date;

    @Column()
    periodEnd: Date;

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
