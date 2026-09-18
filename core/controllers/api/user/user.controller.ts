import { CheckJwt, CheckIsSaasAdmin, Controller, Delete, Error, Get, Put, RateLimit } from "../../../decorators";
import { Request, Response } from "express";
import { UserRepository } from "../../../databases/repositories/user.repository";
import { OrganizationMemberRepository } from "../../../databases/repositories/organization-member.repository";
import { OrganizationRepository } from "../../../databases/repositories/organization.repository";
import { TokenRepository } from "../../../databases/repositories/token.repository";
import { RefreshTokenRepository } from "../../../databases/repositories/refresh-token.repository";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import Messages from "../../../config/messages";
import { getUserUuid } from "../../../helpers/request-context.helper";
import { UserOrigin } from "../../../databases/entities/user.entity";
import { TokenType } from "../../../databases/entities/token.entity";
import { MailService } from "../../../services/mail.service";
import { cancelActiveSubscription } from "../../../helpers/stripe.helper";

@Controller("user")
export default class UserController {
    @Put("/me")
    @CheckJwt()
    @Error()
    async updateMe(req: Request, res: Response) {
        const uuid = getUserUuid();
        const { firstname, lastname } = req.body;

        const user = await UserRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid),
            },
        });

        user.firstname = firstname;
        user.lastname = lastname;

        await UserRepository.save(user);

        delete user.password;

        return res.status(HttpCode.OK).send({
            message: Messages.USER_PROFILE_UPDATED,
            entity: user,
        });
    }

    @Put("/me/password")
    @CheckJwt()
    @Error()
    async updatePassword(req: Request, res: Response) {
        const uuid = getUserUuid();

        const { currentPassword, newPassword } = req.body;

        const user = await UserRepository.findOneOrFail({ where: { uuid: Equal(uuid) } });

        if (user.origin !== UserOrigin.LOCAL) {
            return res.status(HttpCode.FORBIDDEN).send({ message: Messages.USER_CANNOT_CHANGE_PASSWORD });
        }

        if (!user.checkIfUnencryptedPasswordIsValid(currentPassword)) {
            return res.status(HttpCode.UNAUTHORIZED).send({ message: Messages.INCORRECT_PASSWORD });
        }

        user.password = newPassword;
        user.hashPassword();

        await UserRepository.save(user);

        // close all refresktoeken, avoid security trouble with old rt
        await RefreshTokenRepository.revokeAllForUser(user.uuid);

        return res.status(HttpCode.OK).send({
            message: Messages.USER_PASSWORD_UPDATED,
        });
    }

    @Delete("/me/request")
    @CheckJwt()
    @RateLimit({ points: 3, duration: 300 })
    @Error()
    async requestDeleteMe(req: Request, res: Response) {
        const uuid = getUserUuid();

        const { blocking } = await OrganizationMemberRepository.classifyOwnedOrganizationsForDeletion(uuid);

        if (blocking.length > 0) {
            const names = blocking.map((org) => org.name).join(", ");

            return res.status(HttpCode.CONFLICT).send({
                message: `Vous êtes l'unique propriétaire de : ${names}, qui compte d'autres membres. Transférez la propriété ou supprimez ces organisations avant de supprimer votre compte.`,
            });
        }

        const user = await UserRepository.findOneOrFail({ where: { uuid: Equal(uuid) } });

        const code = await TokenRepository.createCodeToken(user, TokenType.delete_account, 15);

        await new MailService().send({
            to: user.email,
            subject: "Confirmation de suppression de votre compte",
            template: "delete-account-code",
            variables: {
                firstname: user.firstname,
                code,
            },
        });

        return res.status(HttpCode.OK).send({
            message: Messages.USER_DELETE_CODE_SENT,
        });
    }

    @Delete("/me/confirm")
    @CheckJwt()
    @RateLimit({ points: 5, duration: 900 })
    @Error()
    async confirmDeleteMe(req: Request, res: Response) {
        const { code } = req.body;
        const uuid = getUserUuid();

        const { blocking, cascadable } = await OrganizationMemberRepository.classifyOwnedOrganizationsForDeletion(
            uuid,
        );

        if (blocking.length > 0) {
            const names = blocking.map((org) => org.name).join(", ");

            // Dynamic error
            return res.status(HttpCode.CONFLICT).send({
                message: `Vous êtes l'unique propriétaire de : ${names}, qui compte d'autres membres. Transférez la propriété ou supprimez ces organisations avant de supprimer votre compte.`,
            });
        }

        const tokenEntity = await TokenRepository.findValidCode(code, TokenType.delete_account, uuid);

        if (!tokenEntity || tokenEntity.isExpired() || tokenEntity.isUsed()) {
            return res.status(HttpCode.UNPROCESSABLE_ENTITY).send({
                message: Messages.USER_DELETE_CODE_INVALID,
            });
        }

        const user = await UserRepository.findOneOrFail({ where: { uuid: Equal(uuid) } });
        const originalEmail = user.email;
        const originalFirstname = user.firstname;

        await TokenRepository.markAsUsed(tokenEntity);

        for (const organization of cascadable) {
            await cancelActiveSubscription(organization.uuid);
            await OrganizationRepository.softRemoveWithRelations(organization);
        }

        await OrganizationMemberRepository.update(
            { memberUuid: Equal(uuid) },
            { deletedAt: new Date(), deletedBy: uuid },
        );

        await RefreshTokenRepository.revokeAllForUser(uuid);

        user.setDeletedAt();
        await UserRepository.save(user);

        await new MailService().send({
            to: originalEmail,
            subject: "Votre compte a été supprimé",
            template: "account-deleted",
            variables: {
                firstname: originalFirstname,
            },
        });

        return res.status(HttpCode.OK).send({
            message: Messages.USER_DELETED,
        });
    }

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
    @CheckIsSaasAdmin()
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
