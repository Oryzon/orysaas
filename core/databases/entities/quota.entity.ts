import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BeforeInsert,
    BeforeUpdate,
    BeforeSoftRemove,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { PlanEntity } from "./plan.entity";

enum QuotaType {
    API_CALLS = "api_calls",
    STORAGE = "storage",
    MEMBERS = "members",
    OTHER = "other",
}

@Entity()
export class QuotaEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({
        type: "enum",
        enum: QuotaType,
    })
    type: QuotaType;

    @Column()
    value: number;

    @Column()
    planUuid: string;

    @ManyToOne(() => PlanEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "planUuid" })
    plan: PlanEntity;

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
