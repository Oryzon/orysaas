import type { NotificationTypes, NotificationAction } from '#shared/notification-types';

export interface Notification {
    uuid: string;
    userUuid: string;
    type: NotificationTypes;
    payload: Record<string, unknown>;
    actions: Array<NotificationAction> | null;
    readAt: string | null;
    createdAt: string;
}