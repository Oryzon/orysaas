import { CheckIsSaasAdmin, CheckJwt, Controller, Error, Post, Delete } from "../../../decorators";
import { Request, Response } from "express";
import { ContactEntity } from "../../../databases/entities/contact.entity";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";
import { ContactRepository } from "../../../databases/repositories/contact.repository";
import { Equal } from "typeorm";
import { MailService } from "../../../services/mail.service";

@Controller("contact")
export default class ContactController {
    @Post("/")
    @Error()
    async create(req: Request, res: Response) {
        const { firstname, lastname, email, company, subject, message } = req.body;

        let entity = new ContactEntity();

        entity.firstname = firstname;
        entity.lastname = lastname;
        entity.email = email;
        entity.company = company;
        entity.subject = subject;
        entity.message = message;

        await ContactRepository.insert(entity);

        return res.status(HttpCode.OK).send({
            message: Messages.CONTACT_SENDED,
        });
    }

    @Post("/:uuid/reply")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async reply(req: Request, res: Response) {
        const uuid = req.params.uuid;
        const { message } = req.body;

        const contact = await ContactRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid),
            },
        });

        await new MailService().send({
            to: contact.email,
            subject: `Réponse à votre message : ${contact.subject}`,
            template: "contact-reply",
            variables: {
                firstname: contact.firstname,
                originalMessage: contact.message,
                replyMessage: message,
            },
        });

        return res.status(HttpCode.OK).send({
            message: Messages.CONTACT_REPLY_SENT,
        });
    }

    @Delete("/:uuid")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async archive(req: Request, res: Response) {
        let uuid = req.params.uuid;

        let contact = await ContactRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid),
            },
        });

        contact.setDeletedAt();

        await ContactRepository.save(contact);

        return res.status(HttpCode.OK).send({
            message: Messages.CONTACT_ARCHIVED,
            entity: contact,
        });
    }
}
