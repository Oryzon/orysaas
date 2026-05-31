import { OrganizationEntity } from "../../../../databases/entities/organization.entity";
import {
    CheckJwt,
    CheckOrganizationMember,
    CheckOrganizationRole,
    Controller,
    Delete,
    Error,
    Put
} from "../../../../decorators";
import { Request, Response } from "express";

import Messages from "../../../../config/messages";
import HttpCode from "../../../../config/http-code";
import { OrganizationMemberRepository } from "../../../../databases/repositories/organization-member.repository";
import { Equal } from "typeorm";
import {
    OrganizationMemberEntity,
    OrganizationMemberRole
} from "../../../../databases/entities/organization-member.entity";

@Controller(':slugOrganization/member')
export default class MemberController {
    @Put('/:memberUuid')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async update(req: Request, res: Response) {
        const memberUuid = req.params.memberUuid;
        const { role } = req.body;
        const organization = res.locals.organization as OrganizationEntity;

        const target = await OrganizationMemberRepository.findOne({
            where: {
                uuid: Equal(memberUuid),
                organizationUuid: Equal(organization.uuid),
            },
        });

        if (!target) {
            return res
                .status(HttpCode.NOT_FOUND)
                .send({ message: Messages.ORGANIZATION_MEMBER_NOT_FOUND });
        }

        if (target.role === OrganizationMemberRole.OWNER) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({ message: Messages.ORGANIZATION_MEMBER_OWNER_CANT_BE_EDITED });
        }

        target.role = role;
        await OrganizationMemberRepository.save(target);

        return res
            .status(HttpCode.OK)
            .send({ message: Messages.ORGANIZATION_MEMBER_UPDATED });
    }

    @Delete('/:memberUuid')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async remove(req: Request, res: Response) {
        const { memberUuid } = req.params;

        const organization = res.locals.organization as OrganizationEntity;

        const target = await OrganizationMemberRepository.findOne({
            where: {
                uuid: Equal(memberUuid),
                organizationUuid: Equal(organization.uuid),
            },
        });

        if (!target) {
            return res
                .status(HttpCode.NOT_FOUND)
                .send({ message: Messages.ORGANIZATION_MEMBER_NOT_FOUND });
        }

        if (target.role === OrganizationMemberRole.OWNER) {
            return res
                .status(HttpCode.FORBIDDEN)
                .send({ message: Messages.ORGANIZATION_MEMBER_OWNER_CANT_BE_EDITED });
        }

        await OrganizationMemberRepository.softRemove(target);

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.ORGANIZATION_MEMBER_REMOVED,
                entity: target
            });
    }
}