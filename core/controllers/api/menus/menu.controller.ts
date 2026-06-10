import { CheckIsSaasAdmin, CheckJwt, Controller, Delete, Error, Get, Post, Put } from "../../../decorators";
import { Request, Response } from "express";
import { MenuRepository } from "../../../databases/repositories/menu.repository";
import HttpCode from "../../../config/http-code";

import { Equal } from "typeorm";
import { MenuEntity } from "../../../databases/entities/menu.entity";
import Messages from "../../../config/messages";

@Controller('menu')
export default class MenuController {
    @Get('/:uuid')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async detail(req: Request, res: Response) {
        let uuid = req.params.uuid;

        let menu = await MenuRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            },
            relations: {
                items: true
            },
            order: {
                items: {
                    position: 'ASC'
                }
            }
        });

        return res.status(HttpCode.OK).send(menu);
    }

    @Post('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async create(req: Request, res: Response) {
        let {
            key,
            label,
            isActive
        } = req.body;

        let menu = new MenuEntity();

        menu.key = key;
        menu.label = label;
        menu.isActive = isActive;

        await MenuRepository.insert(menu);

        return res.status(HttpCode.OK).send({
            message: Messages.MENU_CREATED,
            entity: menu,
        })
    }

    @Put('/:uuid')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async update(req: Request, res: Response) {
        let uuid = req.params.uuid;

        let menu = await MenuRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            }
        });

        let {
            label,
            isActive
        } = req.body;

        menu.label = label;
        menu.isActive = isActive;

        await MenuRepository.save(menu);

        return res.status(HttpCode.OK).send({
            message: Messages.MENU_UPDATED,
            entity: menu,
        });
    }

    @Delete('/:uuid')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async remove(req: Request, res: Response) {
        let uuid = req.params.uuid;

        let menu = await MenuRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            }
        });
        menu.setDeletedAt();

        await MenuRepository.save(menu);

        return res.status(HttpCode.OK).send({
            message: Messages.MENU_DELETED,
            entity: menu
        });
    }
}