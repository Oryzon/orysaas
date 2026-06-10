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
import { MenuItemEntity } from "./menu-item.entity";

@Entity()
export class MenuEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    key: string;

    @Column()
    label: string;

    @Column()
    isActive: boolean;

    @OneToMany(() => MenuItemEntity, (item) => item.menu)
    items!: MenuItemEntity[];

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