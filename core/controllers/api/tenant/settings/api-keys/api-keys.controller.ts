import {CheckJwt, CheckOrganizationMember, CheckOrganizationRole, Controller, Error, Get} from "../../../../../decorators";
import {OrganizationMemberRole} from "../../../../../../shared/organization-roles";
import {Request, Response} from "express";
import {OrganizationRepository} from "../../../../../databases/repositories/organization.repository";
import {ApiKeyRepository} from "../../../../../databases/repositories/api-key.repository";
import {Equal} from "typeorm";
import HttpCode from "../../../../../config/http-code";

@Controller('/tenant/:slugOrganization/setting/api-keys')
export default class TenantSettingApiKeysController {
    @Get('/')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async list(req: Request, res: Response) {
        const slugOrganization = req.params.slugOrganization;
        let organization = await OrganizationRepository.getOrganizationBySlug(slugOrganization);

        let apiKeys = await ApiKeyRepository.find({
            where: {
                organizationUuid: Equal(organization.uuid)
            }
        });

        return res.status(HttpCode.OK).send(apiKeys);
    }
}