import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { DateTime } from "luxon";
import { UserEntity } from "./user.entity";

export type TokenType = 'verify_account' | 'reset_password' | 'invite';

@Entity()
export class TokenEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true })
    token: string;

    @Column()
    type: TokenType;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    usedAt: Date;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = DateTime.now().toJSDate();
    }

    isExpired(): boolean {
        return DateTime.now().toJSDate() > this.expiresAt;
    }

    isUsed(): boolean {
        return this.usedAt !== null;
    }
}