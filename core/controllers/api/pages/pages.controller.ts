import { CheckJwt, Controller, Error, Get, Post, Put, Delete } from "../../../decorators";
import { Request, Response } from "express";
import { PageRepository } from "../../../databases/repositories/page.repository";
import HttpCode from "../../../config/http-code";

@Controller('pages')
export default class PagesController {

    @Get('/')
    @CheckJwt()
    @Error()
    async list(req: Request, res: Response) {
        let pages = await PageRepository.find({
            order: {
                createdAt: 'ASC'
            }
        });

        return res.status(HttpCode.OK).send(pages);
    }
}