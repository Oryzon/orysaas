import {
    CheckJwt,
    CheckOrganizationMember,
    CheckOrganizationRole,
    Controller, Delete,
    Error, Get,
    Post
} from "../../../../../decorators";
import {Request, Response} from "express";
import {OrganizationMemberRole} from "../../../../../../shared/organization-roles";
import {ApiKeyEntity, ApiKeyType} from "../../../../../databases/entities/api-key.entity";
import HttpCode from "../../../../../config/http-code";
import Messages from "../../../../../config/messages";
import {decrypt, encrypt} from "../../../../../helpers/crypto.helper";
import {ApiKeyRepository} from "../../../../../databases/repositories/api-key.repository";
import {OrganizationRepository} from "../../../../../databases/repositories/organization.repository";
import {Equal} from "typeorm";
import {randomBytes} from "crypto";

@Controller('/tenant/:slugOrganization/setting/api-key')
export default class TenantSettingApiKeyController {

    @Get('/:uuid')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async view(req: Request, res: Response) {
        const slugOrganization = req.params.slugOrganization;
        const uuidKey = req.params.uuid;
        const organization = await OrganizationRepository.getOrganizationBySlug(slugOrganization);

        const apiKey = await ApiKeyRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidKey),
                organizationUuid: Equal(organization.uuid)
            }
        });

        const decrypted = decrypt(apiKey.value);

        return res.status(HttpCode.OK).send(decrypted);
    }

    @Post('/')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async create(req: Request, res: Response) {
        const slugOrganization = req.params.slugOrganization;

        const {
            label,
            type,
            value,
            expiresAt,
            systemKey
        } = req.body;

        if (!label || !type || !Object.values(ApiKeyType).includes(type)) {
            return res
                .status(HttpCode.BAD_REQUEST)
                .send({
                    message: Messages.MISSING_PARAMETERS
                });
        }

        let organization = await OrganizationRepository.getOrganizationBySlug(slugOrganization);

        if (systemKey) {
            const existing = await ApiKeyRepository.findOne({
                where: {
                    systemKey: Equal(systemKey),
                    organizationUuid: Equal(organization.uuid),
                },
            });

            if (existing) {
                return res
                    .status(HttpCode.CONFLICT)
                    .send({
                        message: Messages.API_KEY_ALREADY_EXISTS
                    });
            }
        }

        const entity = new ApiKeyEntity();

        entity.label = label;
        entity.type = type;
        entity.value = encrypt(type === ApiKeyType.CONSUMER ? randomBytes(32).toString("hex") : value);
        entity.expiresAt = expiresAt ?? null;
        entity.organizationUuid = null;
        entity.systemKey = systemKey ?? null;
        entity.organization = organization;

        await ApiKeyRepository.insert(entity);

        return res.status(HttpCode.CREATED).send({
            message: Messages.API_KEY_CREATED,
            entity: { ...entity, value },
        });
    }

    @Delete('/:uuid')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async delete(req: Request, res: Response) {
        const slugOrganization = req.params.slugOrganization;
        const uuidKey = req.params.uuid;
        const organization = await OrganizationRepository.getOrganizationBySlug(slugOrganization);

        const apiKey = await ApiKeyRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidKey),
                organizationUuid: Equal(organization.uuid)
            }
        });

        apiKey.setDeletedAt();

        await ApiKeyRepository.save(apiKey);

        return res.status(HttpCode.OK).send({
            message: Messages.API_KEY_DELETED,
            entity: apiKey
        });
    }
}