import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    userUuid: string;

    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column()
    token: string;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    revokedAt: Date;
}
