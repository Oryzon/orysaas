import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    @Index()
    userUuid: string;

    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column()
    @Index({ unique: true })
    token: string;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    revokedAt: Date;
}
