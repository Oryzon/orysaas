import { Controller, Error, CheckJwt, Post, Get } from "../../../../decorators";
import { Request, Response } from "express";
import Messages from "../../../../config/messages";
import HttpCode from "../../../../config/http-code";
import { dataSource } from "../../../../config/datasource";
import { OrganizationEntity } from "../../../../databases/entities/organization.entity";
import { OrganizationRepository } from "../../../../databases/repositories/organization.repository";
import { OrganizationMemberEntity } from "../../../../databases/entities/organization-member.entity";
import { OrganizationMemberRepository } from "../../../../databases/repositories/organization-member.repository";
import { OrganizationMemberRole } from "../../../../../shared/organization-roles";
import { getUserUuid } from "../../../../helpers/request-context.helper";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { organizationLogoService } from "../../../../services/organization-logo.service";

@Controller("/tenant/organizations")
export default class TenantOrganizationController {
    @Post("/")
    @CheckJwt()
    @Error()
    async create(req: Request, res: Response) {
        const tmpDir = path.join(process.cwd(), "uploads", "tmp");
        fs.mkdirSync(tmpDir, { recursive: true });

        const form = formidable({ uploadDir: tmpDir, keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
        const [fields, files] = await form.parse(req);

        const name = fields.name?.[0];
        const address = fields.address?.[0];
        const postalCode = fields.postalCode?.[0];
        const city = fields.city?.[0];
        const country = fields.country?.[0];

        const slug = await OrganizationRepository.getSlug(name);
        const logoFile = files.logo?.[0];
        const memberUuid = getUserUuid();

        // make an transac, because if one step fail, we fix it for avoid empty org
        const entity = await dataSource.transaction(async (manager) => {
            const organizationRepository = manager.withRepository(OrganizationRepository);
            const organizationMemberRepository = manager.withRepository(OrganizationMemberRepository);

            const entity = new OrganizationEntity();

            entity.name = name;
            entity.slug = slug;
            entity.address = address;
            entity.postalCode = postalCode;
            entity.city = city;
            entity.country = country;
            entity.logoUrl = null;

            await organizationRepository.insert(entity);

            if (logoFile) {
                entity.logoUrl = await organizationLogoService.save(logoFile, entity.uuid, req);
                await organizationRepository.save(entity);
            }

            const member = new OrganizationMemberEntity();

            member.organizationUuid = entity.uuid;
            member.memberUuid = memberUuid;
            member.role = OrganizationMemberRole.OWNER;

            await organizationMemberRepository.save(member);

            return entity;
        });

        const tmpEntity = {
            ...entity,
            nbMembers: 1,
            role: OrganizationMemberRole.OWNER,
        };

        return res.status(HttpCode.OK).send({
            message: Messages.ORGANIZATION_CREATED,
            entity: tmpEntity,
        });
    }
}
