import { CheckIsSaasAdmin, CheckJwt, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import { ContactEntity } from "../../../databases/entities/contact.entity";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";
import { ContactRepository } from "../../../databases/repositories/contact.repository";

@Controller('contacts')
export default class ContactsController {

    @Get('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async list(req: Request, res: Response) {
        let contacts = await ContactRepository.find();

        return res.status(HttpCode.OK).send(contacts);
    }
}