import {
    Controller,
    Error,
    Get,
    Put,
    Post,
    Delete,
    CheckJwt,
    CheckOrganizationMember,
    CheckOrganizationRole
} from "../../../../decorators";
import { Request, Response } from "express";
import { OrganizationRepository } from "../../../../databases/repositories/organization.repository";
import HttpCode from "../../../../config/http-code";
import { OrganizationEntity } from "../../../../databases/entities/organization.entity";
import { OrganizationMemberRole } from "../../../../databases/entities/organization-member.entity";
import Messages from "../../../../config/messages";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { organizationLogoService } from "../../../../services/organization-logo.service";
import { getUserUuid } from "../../../../helpers/request-context.helper";
import { UserRepository } from "../../../../databases/repositories/user.repository";
import { TokenRepository } from "../../../../databases/repositories/token.repository";
import { TokenType } from "../../../../databases/entities/token.entity";
import { MailService } from "../../../../services/mail.service";
import { Equal, Not } from "typeorm";
import { OrganizationMemberRepository } from "../../../../databases/repositories/organization-member.repository";


@Controller('/tenant/:slugOrganization/setting')
export default class TenantSettingController {

    @Get('/details')
    @CheckJwt()
    @CheckOrganizationMember()
    @Error()
    async details(req: Request, res: Response) {
        return res
            .status(HttpCode.OK)
            .send(res.locals.organization);
    }

    @Post('/logo')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async uploadLogo(req: Request, res: Response) {
        const organization = res.locals.organization as OrganizationEntity;

        const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
        fs.mkdirSync(tmpDir, { recursive: true });

        const form = formidable({ uploadDir: tmpDir, keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
        const [, files] = await form.parse(req);
        const file = files.logo?.[0];

        if (!file) {
            return res
                .status(HttpCode.BAD_REQUEST)
                .send({ message: Messages.ORGANIZATION_LOGO_FILE_MISSING });
        }

        organization.logoUrl = await organizationLogoService.save(file, organization.uuid, req);

        await OrganizationRepository.save(organization);

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.ORGANIZATION_LOGO_UPDATED,
                logoUrl: organization.logoUrl
            });
    }

    @Put('/')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async update(req: Request, res: Response) {
        let {
            name,
            slug,
            legalForm,
            siret,
            shareCapital,
            nafCode,
            vatCode,
            cityRegistry,
            address,
            city,
            postalCode,
            country,
        } = req.body;

        let entity = res.locals.organization as OrganizationEntity;

        entity.name = name;
        entity.slug = slug;
        entity.legalForm = legalForm;
        entity.siret = siret;
        entity.shareCapital = shareCapital;
        entity.nafCode = nafCode;
        entity.vatCode = vatCode;
        entity.cityRegistry = cityRegistry;
        entity.address = address;
        entity.city = city;
        entity.postalCode = postalCode;
        entity.country = country;

        await OrganizationRepository.save(entity);

        return res.status(HttpCode.OK).send({
            message: Messages.ORGANIZATION_UPDATED,
            entity
        })
    }

    @Delete('/request')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.OWNER)
    @Error()
    async request(req: Request, res: Response) {
        const organization = res.locals.organization as OrganizationEntity;

        const user = await UserRepository.findOneOrFail({
            where: {
                uuid: Equal(getUserUuid())
            }
        });

        const code = await TokenRepository.createCodeToken(user, TokenType.delete_organization, 15);

        await new MailService().send({
            to: user.email,
            subject: `Confirmation de suppression de ${organization.name}`,
            template: 'delete-organization',
            variables: {
                firstname: user.firstname,
                organizationName: organization.name,
                code,
            },
        });

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.ORGANIZATION_DELETE_CODE_SENT,
            });
    }

    @Delete('/confirm')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.OWNER)
    @Error()
    async confirm(req: Request, res: Response) {
        const { code } = req.body;
        const organization = res.locals.organization as OrganizationEntity;
        const userUuid = getUserUuid();

        const tokenEntity = await TokenRepository.findValidCode(code, TokenType.delete_organization, userUuid);

        if (!tokenEntity || tokenEntity.isExpired() || tokenEntity.isUsed()) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({
                    message: Messages.ORGANIZATION_DELETE_CODE_INVALID,
                });
        }

        const otherMemberships = await OrganizationMemberRepository.find({
            where: {
                memberUuid: Equal(userUuid),
                organizationUuid: Not(Equal(organization.uuid)),
            },
            relations: {
                organization: true
            },
            order: {
                createdAt: 'ASC'
            },
        });

        await TokenRepository.markAsUsed(tokenEntity);

        await OrganizationRepository.softRemoveWithRelations(organization);

        const nextOrg = otherMemberships.find(m => !m.organization.deletedAt) ?? null;

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.ORGANIZATION_DELETED,
                nextOrgSlug: nextOrg?.organization?.slug ?? null,
            });
    }
}