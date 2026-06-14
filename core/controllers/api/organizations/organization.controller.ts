import { Controller, Error, CheckJwt, Get } from "../../../decorators";
import { Request, Response } from "express";
import { Equal } from "typeorm";
import HttpCode from "../../../config/http-code";
import { OrganizationRepository } from "../../../databases/repositories/organization.repository";

@Controller("organization")
export default class OrganizationController {
    @Get("/:slug")
    @CheckJwt()
    @Error()
    async getBySlug(req: Request, res: Response) {
        const { slug } = req.params;

        const organization = await OrganizationRepository.findOne({
            where: { slug: Equal(slug) },
            relations: {
                members: {
                    member: true,
                },
            },
        });

        if (!organization) {
            return res.status(HttpCode.NOT_FOUND).send({ message: "Organization not found" });
        }

        return res.status(HttpCode.OK).send(organization);
    }
}
