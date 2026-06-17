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
import { UserEntity } from "./user.entity";
import { OrganizationMemberRole } from "../../../shared/organization-roles";
export { OrganizationMemberRole };

@Entity()
@Index(['organizationUuid', 'uniqueKey'], { unique: true })
export class OrganizationMemberEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    @Index()
    organizationUuid: string;

    @ManyToOne(() => OrganizationEntity, (o) => o.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationUuid' })
    organization: OrganizationEntity;

    @Column()
    @Index()
    memberUuid: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memberUuid' })
    member: UserEntity;

    @Column({ type: 'enum', enum: OrganizationMemberRole })
    role: OrganizationMemberRole;

    @Column({
        type: 'varchar',
        length: 36,
        generatedType: 'STORED',
        asExpression: `IF(deletedAt IS NULL, memberUuid, uuid)`,
    })
    uniqueKey: string;

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