import { BeforeInsert, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DateTime } from "luxon";
import { getUserUuid } from "../../helpers/request-context.helper";
import { OrganizationEntity } from "./organization.entity";

@Entity()
@Index(["stripeInvoiceId"], { unique: true })
export class InvoiceEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column()
    stripeInvoiceId: string;

    @Column()
    @Index()
    organizationUuid: string;

    @ManyToOne(() => OrganizationEntity, (organization) => organization.invoices)
    @JoinColumn({ name: "organizationUuid" })
    organization: OrganizationEntity;

    @Column({ nullable: true })
    number: string | null;

    @Column()
    date: Date;

    @Column("float")
    amount: number;

    @Column()
    currency: string;

    @Column()
    status: string;

    @Column({ nullable: true })
    hostedInvoiceUrl: string | null;

    @Column({ nullable: true })
    invoicePdf: string | null;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdBy: string;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = DateTime.now().toJSDate();
        this.createdBy = getUserUuid();
    }
}
