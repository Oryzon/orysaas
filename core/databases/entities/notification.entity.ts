import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { DateTime } from "luxon";
import { NotificationTypes } from "../../../shared/notification-types";

@Entity()
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    userUuid: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userUuid' })
    user: UserEntity;

    @Column()
    type: NotificationTypes;

    @Column({ type: "json" })
    payload: Record<string, unknown>;

    @Column({ nullable: true })
    readAt: Date | null;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = DateTime.now().toJSDate();
    }

    setReadedAt() {
        this.readAt = DateTime.now().toJSDate();
    }
}