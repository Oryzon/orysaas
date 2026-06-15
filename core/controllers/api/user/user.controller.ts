import { CheckJwt, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import { UserRepository } from "../../../databases/repositories/user.repository";
import { OrganizationMemberRepository } from "../../../databases/repositories/organization-member.repository";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import Messages from "../../../config/messages";
import { getUserUuid } from "../../../helpers/request-context.helper";

@Controller("user")
export default class UserController {
    @Get("/me")
    @CheckJwt()
    @Error()
    async me(req: Request, res: Response) {
        const uuid = getUserUuid();

        const user = await UserRepository.findOne({
            where: {
                uuid: Equal(uuid),
            },
        });

        if (!user) {
            return res.status(HttpCode.NOT_FOUND).send({
                message: Messages.USER_NOT_FOUND,
            });
        }

        delete user.password;

        return res.status(HttpCode.OK).send(user);
    }

    @Get("/organization")
    @CheckJwt()
    @Error()
    async organization(req: Request, res: Response) {
        const slug = req.query.slug as string;
        const userUuid = getUserUuid();

        const organization = slug
            ? await OrganizationMemberRepository.findLightBySlug(userUuid, slug)
            : await OrganizationMemberRepository.findLight(userUuid);

        return res.status(HttpCode.OK).send(organization);
    }

    @Get("/organizations")
    @CheckJwt()
    @Error()
    async listOrganization(req: Request, res: Response) {
        const organizations = await OrganizationMemberRepository.findAll(getUserUuid());

        return res.status(HttpCode.OK).send(organizations);
    }

    @Get("/:uuid")
    @CheckJwt()
    @Error()
    async getUserByUuid(req: Request, res: Response) {
        const uuid = req.params.uuid;

        const user = await UserRepository.findOne({
            where: {
                uuid: Equal(uuid),
            },
        });

        if (!user) {
            return res.status(HttpCode.NOT_FOUND).send({
                message: Messages.USER_NOT_FOUND,
            });
        }

        delete user.password;
        const organizations = await OrganizationMemberRepository.findAll(uuid);

        return res.status(HttpCode.OK).send({
            ...user,
            organizations,
        });
    }
}
