import { CheckJwt, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import { UserRepository } from "../../../databases/repositories/user.repository";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import Messages from "../../../config/messages";

@Controller('user')
export default class UserController {

    @Get('/me')
    @CheckJwt()
    @Error()
    async me(req: Request, res: Response) {
        const { uuid } = res.locals.jwtPayload;

        const user = await UserRepository.findOne({
            where: { uuid: Equal(uuid) },
        });

        if (!user) {
            return res
                .status(HttpCode.NOT_FOUND)
                .send({ message: Messages.USER_NOT_FOUND });
        }

        const { password, ...safeUser } = user as any;

        return res
            .status(HttpCode.OK)
            .json(safeUser);
    }
}