import {
    BeforeInsert,
    BeforeSoftRemove,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity, JoinTable, ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { RoleEntity } from "./role.entity";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @ManyToMany(() => RoleEntity, (role) => role.users, { cascade: true })
    @JoinTable({
        name: 'user_roles', // Name of the join table
        joinColumn: {
            name: 'userUuid',
            referencedColumnName: 'uuid',
        },
        inverseJoinColumn: {
            name: 'roleUuid',
            referencedColumnName: 'uuid',
        },
    })
    roles: RoleEntity[];

    @Column({ nullable: true })
    firstname: string;

    @Column({ nullable: true })
    lastname: string;

    @Column()
    isActive: boolean;

    @Column()
    canLogIn: boolean;

    @Column()
    needPasswordReset: boolean;

    @Column({ nullable: true })
    lastLogin: Date;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdBy: string;

    @Column({ nullable: true })
    @UpdateDateColumn()
    updatedAt: Date;

    @Column( { nullable: true })
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
        this.email = `deleted_${this.uuid}_${this.email}`;
        this.username = `deleted_${this.uuid}_${this.username}`;
        this.deletedAt = DateTime.now().toJSDate();
        this.deletedBy = getUserUuid()
    }

    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8);
    }

    checkIfUnencryptedPasswordIsValid(unecryptedPassword: string) {
        return bcrypt.compareSync(unecryptedPassword, this.password);
    }
}