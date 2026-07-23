export enum SubscriptionStatus {
    TRIALING = 'trialing',
    ACTIVE   = 'active',
    PAST_DUE = 'past_due',
    CANCELED = 'canceled',
    UNPAID   = 'unpaid',
}

export const SubscriptionStatusLabel: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.TRIALING]: "Essai en cours",
    [SubscriptionStatus.ACTIVE]: "Actif",
    [SubscriptionStatus.PAST_DUE]: "Paiement en retard",
    [SubscriptionStatus.CANCELED]: "Annulé",
    [SubscriptionStatus.UNPAID]: "Impayé",
}