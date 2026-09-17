export interface Invoice {
    id: string;
    number: string | null;
    date: number; // unix seconds
    amount: number;
    currency: string;
    status: "draft" | "open" | "paid" | "uncollectible" | "void" | null;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
}
