import {
    BeforeInsert, BeforeSoftRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity, Index, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { OrganizationEntity } from "./organization.entity";
import { ApiKeySystem } from "../../../shared/api-key-systems";

export enum ApiKeyType {
    INTEGRATION = 'INTEGRATION',
    CONSUMER    = 'CONSUMER',
}

@Entity()
export class ApiKeyEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    label: string;

    @Column({ type: 'enum', enum: ApiKeyType })
    type: ApiKeyType;

    @Column({ nullable: true })
    @Index()
    systemKey: ApiKeySystem | null;

    @Column()
    value: string;

    @Column({ nullable: true })
    @Index()
    organizationUuid: string | null;

    @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'organizationUuid' })
    organization: OrganizationEntity | null;

    @Column({ nullable: true })
    expiresAt: Date | null;

    @Column({ nullable: true })
    lastUsedAt: Date | null;

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