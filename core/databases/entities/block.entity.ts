// entities/block.entity.ts
import {
    BeforeInsert,
    BeforeSoftRemove,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { PageEntity } from "./page.entity";

@Entity()
export class BlockEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    pageUuid: string;

    @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pageUuid' })
    page: PageEntity;

    @Column({
        type: 'enum',
        enum: ['hero', 'one-columns', 'two-columns', 'three-columns', 'gallery', 'cta', 'testimonials', 'separator', 'super-hero', 'faq', 'multi-cards'],
    })
    type: string;

    @Column({ type: 'int' })
    order: number;

    @Column({ type: 'json' })
    data: Record<string, any>;

    @Column({ default: true })
    visible: boolean;

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
        this.deletedBy = getUserUuid();
    }
}
