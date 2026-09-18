import { describe, it, expect } from "vitest";
import Stripe from "stripe";
import { Equal } from "typeorm";
import { upsertInvoiceFromStripe } from "../build/core/helpers/stripe.helper";
import { InvoiceRepository } from "../build/core/databases/repositories/invoice.repository";
import { createOrganization } from "./helpers/fixtures";

function buildStripeInvoice(overrides: Partial<Stripe.Invoice> = {}): Stripe.Invoice {
    return {
        id: `in_test_${Math.random().toString(36).slice(2)}`,
        number: "INV-0001",
        created: Math.floor(Date.now() / 1000),
        amount_paid: 4900,
        currency: "eur",
        status: "paid",
        hosted_invoice_url: "https://stripe.example/invoice",
        invoice_pdf: "https://stripe.example/invoice.pdf",
        ...overrides,
    } as Stripe.Invoice;
}

describe("[ Invoice Helper ]", () => {
    it("creates an InvoiceEntity from a Stripe invoice", async () => {
        const org = await createOrganization();
        const stripeInvoice = buildStripeInvoice();

        const invoice = await upsertInvoiceFromStripe(stripeInvoice, org.uuid);

        expect(invoice.organizationUuid).toBe(org.uuid);
        expect(invoice.stripeInvoiceId).toBe(stripeInvoice.id);
        expect(invoice.amount).toBe(49);
        expect(invoice.status).toBe("paid");
    });

    it("upserting the same stripeInvoiceId again updates the row instead of duplicating it", async () => {
        const org = await createOrganization();
        const stripeInvoice = buildStripeInvoice({ status: "open", amount_paid: 0 });

        await upsertInvoiceFromStripe(stripeInvoice, org.uuid);
        await upsertInvoiceFromStripe(buildStripeInvoice({ id: stripeInvoice.id, status: "paid", amount_paid: 4900 }), org.uuid);

        const rows = await InvoiceRepository.find({ where: { stripeInvoiceId: Equal(stripeInvoice.id) } });

        expect(rows).toHaveLength(1);
        expect(rows[0].status).toBe("paid");
        expect(rows[0].amount).toBe(49);
    });
});
