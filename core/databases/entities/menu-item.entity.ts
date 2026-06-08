import {
    BeforeInsert, BeforeSoftRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity, JoinColumn, ManyToOne, OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { MenuEntity } from "./menu.entity";

@Entity()
export class MenuItemEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ManyToOne(() => MenuEntity, (menu) => menu.items, { onDelete: 'CASCADE' })
    @JoinColumn()
    menu!: MenuEntity;

    @Column()
    menuUuid!: string;

    @ManyToOne(() => MenuItemEntity, (item) => item.children, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    parent!: MenuItemEntity | null;

    @OneToMany(() => MenuItemEntity, (item) => item.parent)
    children!: MenuItemEntity[];

    @Column({ nullable: true })
    parentUuid!: string | null;

    @Column({ length: 190 })
    label!: string;

    @Column({ type: 'int', default: 0 })
    position!: number;

    @Column()
    url: string;

    @Column({ length: 20, default: '_self' })
    target!: '_self' | '_blank';

    @Column()
    isVisible: boolean;

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