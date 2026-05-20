import { Controller, Error, Get, Put, Delete, CheckJwt } from "../../../decorators";
import { Request, Response } from "express";
import { getUserUuid } from "../../../helpers/request-context.helper";
import { NotificationRepository } from "../../../databases/repositories/notification.repository";
import { Equal } from "typeorm";
import { DateTime } from "luxon";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";

@Controller('notification')
export default class NotificationController {

    @Get('/:uuid/read')
    @CheckJwt()
    @Error()
    async read(req: Request, res: Response) {
        let userUuid = getUserUuid();
        let { uuid } = req.params;

        let notif = await NotificationRepository.findOne({
            where: {
                uuid: Equal(uuid),
                userUuid: Equal(userUuid)
            }
        });

        // Check: avoid error if notif isn't of the user, avoid attaqaunt search about security fails.
        if (notif) {
            notif.setReadedAt();

            await NotificationRepository.save(notif);
        }

        return res.status(HttpCode.OK).send({
            message: Messages.NOTIFICATION_READED
        });
    }
}