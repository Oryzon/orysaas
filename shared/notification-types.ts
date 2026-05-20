export const NOTIFICATION_TYPES = {
    EXAMPLE_TEST: {
        icon: 'mdi-message',
        color: 'success',
        label: "Texte header",
        template: (payload: { variable1: string, variable2: string }) => `${payload.variable1} est défini, tout comme ${payload.variable2}`
    }
} as const;

export type NotificationTypes = keyof typeof NOTIFICATION_TYPES;
export type NotificationPayload<T extends NotificationTypes> = Parameters<typeof NOTIFICATION_TYPES[T]['template']>[0];