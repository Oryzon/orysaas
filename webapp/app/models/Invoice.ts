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

export const enumStatus = [
    { value: "draft", title: "Brouillon", color: "secondary", icon: "" },
    { value: "open", title: "En attente", color: "warning", icon: "" },
    { value: "paid", title: "Payée", color: "success", icon: "" },
    { value: "uncollectible", title: "Impayée", color: "error", icon: "" },
    { value: "void", title: "Annulée", color: "secondary", icon: "" },
]

export const getLabel = (value: string) => {
    let find = enumStatus.find((item) => item.value === value);

    return find?.title ?? '';
}

export const getColor = (value: string) => {
    let find = enumStatus.find((item) => item.value === value);

    return find?.color ?? '';
}