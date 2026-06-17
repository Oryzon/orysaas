import { Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { MenuRepository } from "../../../databases/repositories/menu.repository";
import { PageRepository } from "../../../databases/repositories/page.repository";
import { Equal } from "typeorm";

@Controller('public')
export default class PublicController {
    @Get('/')
    @Error()
    async bootstrap(req: Request, res: Response) {
        let headerMenu = await MenuRepository.getPublicWithKey('header');
        let footerMenu = await MenuRepository.getPublicWithKey('footer');

        return res.status(HttpCode.OK).send({
            menus: {
                header: headerMenu,
                footer: footerMenu
            }
        });
    }

    @Get('/sitemap')
    @Error()
    async sitemap(req: Request, res: Response) {
        let pages = await PageRepository.find({
            where: {
                isPublished: Equal(true)
            }
        });

        return res.status(HttpCode.OK).send(pages.map((page: any) => ({
            loc: `/${page.slug}`,
            lastmod: page.updatedAt,
        })));
    }
}