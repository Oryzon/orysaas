import { Cron } from "../decorators";
import { UserRepository } from "../databases/repositories/user.repository";
import { notificationService } from "../services/notification.service";

export class NotificatorTesterJobs {
    @Cron('notificator-tester', '* * * * *')
    async run() {
        const users = await UserRepository.find({ select: { uuid: true } });

        for (const user of users) {
            await notificationService.send(user.uuid, 'EXAMPLE_TEST', {
                variable1: 'testVibo',
                variable2: 'Oui oui baguette'
            })
        }

        return {
            success: true,
            input: {},
            output: {
                txt: `Notif envoyée à ${users.length}`
            }
        }
    }
}