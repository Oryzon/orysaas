import {
    BeforeInsert,
    BeforeSoftRemove,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";

export enum UserOrigin {
    LOCAL = "local",
    GOOGLE = "google",
    FACEBOOK = "facebook",
    MICROSOFT = "microsoft",
}

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    password?: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    firstname: string;

    @Column({ nullable: true })
    lastname: string;

    @Column({ type: "enum", enum: UserOrigin, default: UserOrigin.LOCAL })
    origin: UserOrigin;

    @Column()
    isActive: boolean;

    @Column({ nullable: true })
    lastLogin: Date;

    @Column({ default: false })
    isSaasAdmin: boolean;

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
        this.email = `deleted_${this.uuid}_${this.email}`;
        this.deletedAt = DateTime.now().toJSDate();
        this.deletedBy = getUserUuid();
    }

    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8);
    }

    checkIfUnencryptedPasswordIsValid(unecryptedPassword: string) {
        return bcrypt.compareSync(unecryptedPassword, this.password);
    }
}
