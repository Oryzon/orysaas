import { Controller, CheckJwt, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import { sseService } from "../../../services/sse.service";
import { UserRepository } from "../../../databases/repositories/user.repository";
import * as jwt from "jsonwebtoken";
import { TokenExpiredError } from "jsonwebtoken";
import HttpCode from "../../../config/http-code";
import { getUserUuid } from "../../../helpers/request-context.helper";
import { NotificationRepository } from "../../../databases/repositories/notification.repository";
import { Equal, LessThan } from "typeorm";
import { DateTime } from "luxon";
import Messages from "../../../config/messages";

@Controller('notifications')
export default class NotificationsController {
    @Get('/')
    @CheckJwt()
    @Error()
    async list(req: Request, res: Response) {
        const userUuid = getUserUuid();

        const cursor = req.query.cursor as string | undefined;
        const LIMIT = 20;

        let cursorDate: Date | undefined;

        if (cursor) {
            const cursorNotif = await NotificationRepository.findOne({
                where: {
                    uuid: Equal(cursor),
                    userUuid: Equal(userUuid)
                },
                select: ['createdAt']
            });

            if (cursorNotif) {
                cursorDate = cursorNotif.createdAt;
            }
        }

        const items = await NotificationRepository.find({
            where: {
                userUuid: Equal(userUuid),
                ...(cursorDate ? { createdAt: LessThan(cursorDate) } : {})
            },
            take: LIMIT + 1,
            order: {
                createdAt: 'DESC'
            }
        });

        const hasMore = items.length > LIMIT;

        const result = hasMore ? items.slice(0, LIMIT) : items;
        const nextCursor = hasMore ? result[result.length - 1]!.uuid : null;

        return res
            .status(HttpCode.OK)
            .send({
                items: result,
                nextCursor
            });
    }

    @Get('/read')
    @CheckJwt()
    @Error()
    async readAll(req: Request, res: Response) {
        let userUuid = getUserUuid();

        await NotificationRepository.update({
            userUuid: Equal(userUuid)
        }, {
            readAt: DateTime.now().toJSDate(),
        });

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.NOTIFICATIONS_READED
            });
    }

    @Get('/stream')
    @Error()
    async stream(req: Request, res: Response) {
        // SSE don't allow custom header, for the jwt is sent from the front as token
        const token = req.query.token as string;

        if (!token) {
            return res
                .status(HttpCode.FORBIDDEN)
                .send({
                    message: Messages.USER_NOT_AUTHED
                });
        }

        let userUuid: string;

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET) as any;
            userUuid = payload.uuid;
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                return res
                    .status(HttpCode.UNAUTHORIZED)
                    .send({
                        message: Messages.TOKEN_INVALID
                    });
            }

            return res
                .status(HttpCode.FORBIDDEN)
                .send({
                    message: Messages.TOKEN_INVALID
                });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        sseService.add(userUuid, res);

        res.write('event: connected\ndata: {}\n\n');

        const heartbeat = setInterval(() => {
            res.write(': ping\n\n');
        }, 30000);

        req.on('close', () => {
            clearInterval(heartbeat);
            sseService.remove(userUuid, res);
        });
    }
}