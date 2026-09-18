import { BeforeInsert, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { DateTime } from "luxon";

// avoid multiple and concurrent data from webhook
@Entity()
export class StripeWebhookEventEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    @Index({ unique: true })
    stripeEventId: string;

    @Column()
    type: string;

    @Column()
    @CreateDateColumn()
    receivedAt: Date;

    @BeforeInsert()
    setReceivedAt() {
        this.receivedAt = DateTime.now().toJSDate();
    }
}
