import { Controller, Error, CheckJwt, Get } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { OrganizationRepository } from "../../../databases/repositories/organization.repository";

@Controller("organizations")
export default class OrganizationController {
    @Get("/")
    @CheckJwt()
    @Error()
    async getAll(req: Request, res: Response) {
        const organizations = await OrganizationRepository.find({
            relations: {
                members: {
                    member: true,
                },
            },
        });

        return res.status(HttpCode.OK).send(organizations);
    }
}
