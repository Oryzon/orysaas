import {NotificationPayload, NotificationTypes} from "../../shared/notification-types";
import {UserRepository} from "../databases/repositories/user.repository";
import {Equal} from "typeorm";
import {notificationService} from "../services/notification.service";

export async function notifySaasOwners<T extends NotificationTypes>(type: T, payload: NotificationPayload<T>) {
    const owners = await UserRepository.find({
        where: {
            isSaasAdmin: Equal(true)
        }
    });

    for (const user of owners) {
        await notificationService.send(user.uuid, type, payload);
    }
}