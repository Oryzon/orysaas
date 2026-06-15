import {
    BeforeInsert, BeforeSoftRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";

@Entity()
export class SettingEntity {
    @PrimaryColumn()
    key: string;

    @Column({ length: 500 })
    value: string;

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
        this.deletedAt = DateTime.now().toJSDate();
        this.deletedBy = getUserUuid()
    }
}