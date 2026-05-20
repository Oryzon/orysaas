import { NotificationRepository } from "../databases/repositories/notification.repository";
import { sseService } from "./sse.service";
import type { NotificationTypes, NotificationPayload } from "../../shared/notification-types";
import { UserRepository } from "../databases/repositories/user.repository";
import { Equal } from "typeorm";

class NotificationService {
    async send<T extends NotificationTypes>(
        userUuid: string,
        type: T,
        payload: NotificationPayload<T>
    ): Promise<void> {
        // First, check user for avoid spam in database
        let user = await UserRepository.findOne({
            where: {
                uuid: Equal(userUuid)
            }
        });

        if (!user) {
            return;
        }

        // Else, send buddy
        const notif = NotificationRepository.create({
            userUuid,
            type,
            payload: payload as Record<string, unknown>,
        });

        await NotificationRepository.save(notif);

        sseService.push(userUuid, 'notification', {
            uuid: notif.uuid,
            userUuid: notif.userUuid,
            type: notif.type,
            payload: notif.payload,
            readAt: null,
            createdAt: notif.createdAt.toISOString(),
        });
    }
}

export const notificationService = new NotificationService();