import type { NotificationTypes } from '#shared/notification-types';

export interface Notification {
    uuid: string;
    userUuid: string;
    type: NotificationTypes;
    payload: Record<string, unknown>;
    readAt: string | null;
    createdAt: string;
}