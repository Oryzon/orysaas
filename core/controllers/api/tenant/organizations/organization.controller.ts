import { Controller, Error, CheckJwt, Post, Get } from "../../../../decorators";
import { Request, Response } from "express";
import { Equal } from "typeorm";
import Messages from "../../../../config/messages";
import HttpCode from "../../../../config/http-code";
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

@Controller("organizations")
export default class OrganizationController {
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

        const entity = new OrganizationEntity();

        entity.name = name;
        entity.slug = slug;
        entity.address = address;
        entity.postalCode = postalCode;
        entity.city = city;
        entity.country = country;
        entity.logoUrl = null;

        await OrganizationRepository.insert(entity);

        const logoFile = files.logo?.[0];

        if (logoFile) {
            entity.logoUrl = await organizationLogoService.save(logoFile, entity.uuid, req);
            await OrganizationRepository.save(entity);
        }

        const member = new OrganizationMemberEntity();

        member.organizationUuid = entity.uuid;
        member.memberUuid = getUserUuid();
        member.role = OrganizationMemberRole.OWNER;

        await OrganizationMemberRepository.save(member);

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
