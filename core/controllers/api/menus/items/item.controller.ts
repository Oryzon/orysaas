import { CheckIsSaasAdmin, CheckJwt, Controller, Delete, Error, Get, Post, Put } from "../../../../decorators";
import { Request, Response } from "express";
import { MenuRepository } from "../../../../databases/repositories/menu.repository";
import { Equal } from "typeorm";
import { MenuItemRepository } from "../../../../databases/repositories/menu-item.repository";
import { MenuItemEntity } from "../../../../databases/entities/menu-item.entity";
import HttpCode from "../../../../config/http-code";
import Messages from "../../../../config/messages";

@Controller('/menu/:uuidMenu/item')
export default class MenuItemController {
    @Post('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async create(req: Request, res: Response) {
        let uuidMenu = req.params.uuidMenu;

        let {
            label,
            url,
            target,
            isVisible,
            parentUuid,
        } = req.body;

        let nextPositionItem = await MenuItemRepository.nextPosition(uuidMenu, parentUuid);

        let menuItem = new MenuItemEntity();

        menuItem.menuUuid = uuidMenu;
        menuItem.parentUuid = parentUuid;
        menuItem.label = label;
        menuItem.url = url;
        menuItem.target = target;
        menuItem.isVisible = isVisible;
        menuItem.position = nextPositionItem;

        await MenuItemRepository.insert(menuItem);

        return res.status(HttpCode.OK).send({
            message: Messages.MENU_ITEM_CREATED,
            entity: menuItem
        });
    }

    @Put('/:uuidItem')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async update(req: Request, res: Response) {
        let uuidMenu = req.params.uuidMenu;
        let uuidItem = req.params.uuidItem;

        let item = await MenuItemRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidItem),
                menuUuid: Equal(uuidMenu)
            }
        });

        let {
            label,
            url,
            target,
            isVisible,
            parentUuid,
        } = req.body;

        item.label = label;
        item.url = url;
        item.target = target;
        item.isVisible = isVisible;
        item.parentUuid = parentUuid;

        await MenuItemRepository.save(item);

        return res.status(HttpCode.OK).send({
            message: Messages.MENU_ITEM_UPDATED,
            entity: item,
        });
    }

    @Put('/:uuidItem/:order')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async move(req: Request, res: Response) {
        let uuidMenu = req.params.uuidMenu;
        let uuidItem = req.params.uuidItem;
        let order = req.params.order;

        let item = await MenuItemRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidItem),
                menuUuid: Equal(uuidMenu)
            }
        });

        let itemToMove = await MenuItemRepository.getItemToMove(item.menuUuid, item.parentUuid, order, item.position);

        let tmpItem = {...item};
        item.position = itemToMove.position;
        itemToMove.position = tmpItem.position;

        await MenuItemRepository.save([item, itemToMove]);

        return res.status(HttpCode.OK).send({
            message: Messages.MENU_ITEM_MOVED,
            entity: [item, itemToMove]
        });
    }

    @Delete('/:uuidItem')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async remove(req: Request, res: Response) {
        let uuidMenu = req.params.uuidMenu;
        let uuidItem = req.params.uuidItem;

        let item = await MenuItemRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidItem),
                menuUuid: Equal(uuidMenu)
            },
            relations: {
                children: true
            }
        });

        item.setDeletedAt();

        await MenuItemRepository.save(item);

        if (item.children) {
            for (let child of item.children) {
                child.parentUuid = item.parentUuid;
            }

            await MenuItemRepository.save(item.children);
        }

        let refreshedMenu = await MenuItemRepository.find({
            where: {
                menuUuid: Equal(item.menuUuid)
            },
            order: {
                position: 'ASC'
            }
        });

        return res.status(HttpCode.OK).send({
            message: Messages.MENU_ITEM_REMOVED,
            entity: refreshedMenu,
        })
    }
}