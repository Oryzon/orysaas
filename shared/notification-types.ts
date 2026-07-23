export interface NotificationAction {
    label?: string;
    icon?: string;
    color?: string;
    endpoint: string;
    body?: Record<string, unknown>;
    redirect?: string;
    refreshOrganization?: boolean;
}

export const NOTIFICATION_TYPES = {
    EXAMPLE_TEST: {
        icon: 'mdi-message',
        color: 'success',
        label: "Texte header",
        template: (payload: { variable1: string, variable2: string }) => `${payload.variable1} est défini, tout comme ${payload.variable2}`
    },
    ORGANIZATION_INVITE: {
        icon: 'mdi-account-plus',
        color: 'primary',
        label: "Invitation à une organisation",
        template: (payload: { organizationName: string; inviterName: string; token: string; organizationSlug: string }) =>
            `${payload.inviterName} vous invite à rejoindre ${payload.organizationName}.`,
    },
    SUBSCRIPTION_STARTED: {
        icon: 'mdi-check-decagram',
        color: 'success',
        label: "Abonnement activé",
        template: (payload: { organizationName: string }) => `Votre abonnement est maintenant actif pour ${payload.organizationName}.`,
    },
    SUBSCRIPTION_CANCELED: {
        icon: 'mdi-close-circle',
        color: 'error',
        label: "Abonnement annulé",
        template: (payload: { organizationName: string }) => `Votre abonnement a été annulé pour ${payload.organizationName}.`,
    },
    PAYMENT_FAILED: {
        icon: 'mdi-alert',
        color: 'error',
        label: "Échec de paiement",
        template: (payload: { organizationName: string }) => `Le paiement de votre abonnement a échoué sur l'organization ${payload.organizationName}. Merci de mettre à jour votre moyen de paiement.`,
    },
} as const;

export type NotificationTypes = keyof typeof NOTIFICATION_TYPES;
export type NotificationPayload<T extends NotificationTypes> = Parameters<typeof NOTIFICATION_TYPES[T]['template']>[0];