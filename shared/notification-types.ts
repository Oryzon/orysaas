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
} as const;

export type NotificationTypes = keyof typeof NOTIFICATION_TYPES;
export type NotificationPayload<T extends NotificationTypes> = Parameters<typeof NOTIFICATION_TYPES[T]['template']>[0];