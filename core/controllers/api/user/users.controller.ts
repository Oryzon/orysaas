import { CheckJwt, CheckIsSaasAdmin, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import { UserRepository } from "../../../databases/repositories/user.repository";
import HttpCode from "../../../config/http-code";

@Controller("users")
export default class UsersController {
    @Get("/")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async me(req: Request, res: Response) {
        const users = await UserRepository.find();

        users.forEach((u) => delete u.password);

        return res.status(HttpCode.OK).send(users);
    }
}
