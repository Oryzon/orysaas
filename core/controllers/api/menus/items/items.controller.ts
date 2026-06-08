import { CheckJwt, Controller, Error, Get, Post, Put } from "../../../../decorators";
import { Request, Response } from "express";
import { MenuItemRepository } from "../../../../databases/repositories/menu-item.repository";
import { Equal } from "typeorm";
import HttpCode from "../../../../config/http-code";

@Controller('/menu/:uuidMenu/items')
export default class MenuItemsController {
    @Get('/')
    @CheckJwt()
    @Error()
    async list(req: Request, res: Response) {
        let uuidMenu = req.params.uuidMenu;

        let items = await MenuItemRepository.find({
            where: {
                menuUuid: Equal(uuidMenu)
            },
            order: {
                position: 'ASC'
            }
        });

        return res.status(HttpCode.OK).send(items);
    }
}