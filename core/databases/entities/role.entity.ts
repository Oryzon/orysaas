import {
    BeforeInsert, BeforeSoftRemove,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn, Entity, JoinTable, ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {DateTime} from "luxon";
import { SystemPageEntity } from "./system-page.entity";
import { UserEntity } from "./user.entity";
import { getUserUuid } from "../../helpers/request-context.helper";
import { PermissionEntity } from "./permission.entity";

@Entity()
export class RoleEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    isActive: boolean;

    @Column({ default: true })
    isDeletable: boolean;

    @ManyToMany(() => PermissionEntity, (permission) => permission.roles, { cascade: true })
    @JoinTable({
        name: 'roles_permissions', // Name of the join table
        joinColumn: {
            name: 'roleUuid',
            referencedColumnName: 'uuid',
        },
        inverseJoinColumn: {
            name: 'permissionUuid',
            referencedColumnName: 'uuid',
        },
    })
    permissions: PermissionEntity[];

    @ManyToMany(() => UserEntity, (user) => user.roles)
    users: UserEntity[];

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
        this.deletedAt = DateTime.now().toJSDate();
    }
}