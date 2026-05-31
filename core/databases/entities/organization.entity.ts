import {
    BeforeInsert, BeforeSoftRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { OrganizationMemberEntity } from "./organization-member.entity";
import { OrganizationInviteEntity } from "./organization-invite.entity";

@Entity()
export class OrganizationEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    name: string;

    @Column()
    slug: string;

    @Column({ nullable: true })
    logoUrl: string | null;

    @Column({ nullable: true })
    legalForm: string | null;

    @Column({ nullable: true })
    siret: string | null;

    @Column({ nullable: true })
    shareCapital: string | null;

    @Column({ nullable: true })
    nafCode: string | null;

    @Column({ nullable: true })
    vatCode: string | null;

    @Column({ nullable: true })
    cityRegistry: string | null;

    @Column()
    address: string;

    @Column()
    city: string;

    @Column()
    postalCode: string;

    @Column()
    country: string;

    @OneToMany(() => OrganizationMemberEntity, (m) => m.organization, {
        cascade: true,
    })
    members: OrganizationMemberEntity[];

    @OneToMany(() => OrganizationInviteEntity, (i) => i.organization, {
        cascade: true,
    })
    invites: OrganizationInviteEntity[];

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