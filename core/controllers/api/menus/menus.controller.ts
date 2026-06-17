import { CheckIsSaasAdmin, CheckJwt, Controller, Error, Get, Post, Put } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { MenuRepository } from "../../../databases/repositories/menu.repository";

@Controller('menus')
export default class MenusController {

    @Get('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async list(req: Request, res: Response) {
        let menus = await MenuRepository.find({
            order: {
                createdAt: 'DESC'
            }
        });

        return res.status(HttpCode.OK).send(menus);
    }
}