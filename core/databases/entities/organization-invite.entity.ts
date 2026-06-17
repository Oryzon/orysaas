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
import { OrganizationMemberRole } from "./organization-member.entity";

@Entity()
export class OrganizationInviteEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({ type: 'uuid' })
    @Index()
    organizationUuid: string;

    @ManyToOne(() => OrganizationEntity, (o) => o.invites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationUuid' })
    organization: OrganizationEntity;

    @Column()
    @Index()
    email: string;

    @Column({ type: 'enum', enum: OrganizationMemberRole })
    role: OrganizationMemberRole;

    @Column({ unique: true })
    token: string;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    acceptedAt: Date | null;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdBy: string;

    @Column({nullable: true})
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({nullable: true})
    updatedBy: string;

    @Column({nullable: true})
    @DeleteDateColumn()
    deletedAt: Date;

    @Column({nullable: true})
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
        this.deletedAt = DateTime.now().toJSDate();
        this.deletedBy = getUserUuid();
    }
}