import { Controller, Error, Get, Put, CheckJwt, Post, CheckOrganizationMember } from "../../../../decorators";
import { Request, Response } from "express";
import { OrganizationMemberRepository } from "../../../../databases/repositories/organization-member.repository";
import { Equal } from "typeorm";
import HttpCode from "../../../../config/http-code";
import { OrganizationEntity } from "../../../../databases/entities/organization.entity";
import { OrganizationMemberRole } from "../../../../databases/entities/organization-member.entity";

const roleLabelMap: Record<OrganizationMemberRole, string> = {
    [OrganizationMemberRole.OWNER]: "Propriétaire",
    [OrganizationMemberRole.ADMIN]: "Administrateur",
    [OrganizationMemberRole.MEMBER]: "Membre",
};

@Controller(':slugOrganization/members')
export default class MembersController {
    @Get('/')
    @CheckJwt()
    @CheckOrganizationMember()
    @Error()
    async list(req: Request, res: Response) {
        const organization = res.locals.organization as OrganizationEntity;

        const members = await OrganizationMemberRepository.find({
            where: {
                organizationUuid: Equal(organization.uuid),
            },
            relations: {
                member: true
            }
        });

        return res
            .status(HttpCode.OK)
            .send(members);
    }
}