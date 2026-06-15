import {
    CheckJwt,
    CheckOrganizationMember,
    CheckOrganizationRole,
    Controller,
    Delete,
    Error,
    Post,
    Put
} from "../../../../decorators";
import { Request, Response } from "express";
import { OrganizationEntity } from "../../../../databases/entities/organization.entity";
import { OrganizationMemberEntity } from "../../../../databases/entities/organization-member.entity";
import { OrganizationMemberRole, OrganizationMemberRoleLabel } from "../../../../../shared/organization-roles";
import HttpCode from "../../../../config/http-code";
import Messages from "../../../../config/messages";
import { OrganizationMemberRepository } from "../../../../databases/repositories/organization-member.repository";
import { Equal } from "typeorm";
import { OrganizationInviteRepository } from "../../../../databases/repositories/organization-invite.repository";
import { DateTime } from "luxon";
import { UserRepository } from "../../../../databases/repositories/user.repository";
import { OrganizationInviteEntity } from "../../../../databases/entities/organization-invite.entity";
import { v4 as uuidv4 } from "uuid";
import { getUserUuid } from "../../../../helpers/request-context.helper";
import { notificationService } from "../../../../services/notification.service";
import { MailService } from "../../../../services/mail.service";

@Controller('/tenant/:slugOrganization/member/invite')
export default class TenantInviteController {
    @Post('/')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async invite(req: Request, res: Response) {
        const {
            email,
            role
        } = req.body;

        const organization = res.locals.organization as OrganizationEntity;

        const existingUser = await UserRepository.findOne({
            where: {
                email: Equal(email)
            }
        });

        if (existingUser) {
            const existingMember = await OrganizationMemberRepository.findOne({
                where: {
                    organizationUuid: Equal(organization.uuid),
                    memberUuid: Equal(existingUser.uuid),
                },
            });

            if (existingMember) {
                return res
                    .status(HttpCode.UNPROCESSABLE_ENTITY)
                    .send({
                        message: Messages.ORGANIZATION_INVITE_ALREADY_MEMBER
                    });
            }
        }

        const pendingInvite = await OrganizationInviteRepository.findPending(email, organization.uuid);

        if (pendingInvite) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({
                    message: Messages.ORGANIZATION_INVITE_ALREADY_PENDING
                });
        }

        const invite = new OrganizationInviteEntity();

        invite.organizationUuid = organization.uuid;
        invite.email = email;
        invite.role = role;
        invite.token = uuidv4();
        invite.expiresAt = DateTime.now().plus({ hours: 72 }).toJSDate();

        await OrganizationInviteRepository.save(invite);

        const inviter = await UserRepository.findOne({
            where: {
                uuid: Equal(getUserUuid())
            }
        });

        const inviterName = inviter ? `${inviter.firstname} ${inviter.lastname}`.trim() : "Un administrateur";

        if (existingUser) {
            await notificationService.send(
                existingUser.uuid,
                'ORGANIZATION_INVITE',
                {
                    organizationName: organization.name,
                    organizationSlug: organization.slug,
                    inviterName,
                    token: invite.token,
                },
                [
                    {
                        icon: "mdi-check",
                        color: "success",
                        endpoint: `/${organization.slug}/member/invite/accept/${invite.token}`,
                        redirect: `/portal/${organization.slug}/members`,
                        refreshOrganization: true,
                    }
                ],
            );
        }

        await new MailService().send({
            to: email,
            subject: `Invitation à rejoindre ${organization.name}`,
            template: "invite",
            variables: {
                organizationName: organization.name,
                inviterName,
                roleLabel: OrganizationMemberRoleLabel[role as OrganizationMemberRole] ?? role,
                inviteUrl: existingUser ? `${process.env.HTTP_URL}/login` : `${process.env.HTTP_URL}/register?inviteToken=${invite.token}`,
                btnLabel: existingUser ? "Se connecter pour accepter" : "Créer mon compte",
                isExistingUser: !!existingUser,
            },
        });

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.ORGANIZATION_INVITE_SENT
            });
    }

    @Post('/accept/:token')
    @CheckJwt()
    @Error()
    async acceptInvite(req: Request, res: Response) {
        const token = req.params.token as string;

        const invite = await OrganizationInviteRepository.findByToken(token);

        if (!invite || DateTime.now().toJSDate() > invite.expiresAt) {
            return res
                .status(HttpCode.NOT_FOUND)
                .send({ message: Messages.ORGANIZATION_INVITE_NOT_FOUND });
        }

        if (invite.acceptedAt) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({ message: Messages.ORGANIZATION_INVITE_ALREADY_ACCEPTED });
        }

        const userUuid = res.locals.jwtPayload?.uuid as string;

        const existingMember = await OrganizationMemberRepository.findOne({
            where: {
                organizationUuid: Equal(invite.organizationUuid),
                memberUuid: Equal(userUuid),
            },
        });

        if (!existingMember) {
            const member = new OrganizationMemberEntity();
            member.organizationUuid = invite.organizationUuid;
            member.memberUuid = userUuid;
            member.role = invite.role;
            await OrganizationMemberRepository.save(member);
        }

        invite.acceptedAt = DateTime.now().toJSDate();
        await OrganizationInviteRepository.save(invite);

        return res.status(HttpCode.OK).send({
            message: Messages.ORGANIZATION_INVITE_ACCEPTED,
            organizationSlug: invite.organization.slug,
        });
    }
}