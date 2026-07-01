import {CheckJwt, CheckIsSaasAdmin, Controller, Error, Get, Post, Put, Delete} from "../../../decorators";
import { Request, Response } from "express";

import { SettingRepository } from "../../../databases/repositories/setting.repository";
import { ApiKeyRepository } from "../../../databases/repositories/api-key.repository";
import { ApiKeyEntity, ApiKeyType } from "../../../databases/entities/api-key.entity";
import { encrypt, decrypt } from "../../../helpers/crypto.helper";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";
import {Equal} from "typeorm";
import {randomBytes} from "crypto";

const KEYS = [
    'siret',
    'adress',
    'city',
    'postalCode',
    'phone',
    'email',
    'legalForm',
    'shareCapital',
    'nafApeCode',
    'identifierVat',
    'rcsCity'
] as const;

type SettingsKey = typeof KEYS[number];
type SettingsPayload = Record<SettingsKey, string>;

@Controller('settings')
export default class SettingsController {
    @Get('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async list(_req: Request, res: Response) {
        const [entries, apiKeys] = await Promise.all([
            Promise.all(KEYS.map(async (key) => [key, await SettingRepository.getValue(key)])),
            ApiKeyRepository.list(),
        ]);

        return res.status(HttpCode.OK).send({ ...Object.fromEntries(entries), apiKeys });
    }

    @Get('/api-key/:uuid')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async viewApiKey(req: Request, res: Response) {
        const uuidKey = req.params.uuid;

        const apiKey = await ApiKeyRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidKey)
            }
        });

        const decrypted = decrypt(apiKey.value);

        return res
            .status(HttpCode.OK)
            .send(decrypted);
    }

    @Post('/api-key')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async createApiKey(req: Request, res: Response) {
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

        const entity = new ApiKeyEntity();

        entity.label = label;
        entity.type = type;
        entity.value = encrypt(type === ApiKeyType.CONSUMER ? randomBytes(32).toString("hex") : value);
        entity.expiresAt = expiresAt ?? null;
        entity.organizationUuid = null;
        entity.systemKey = systemKey ?? null;

        await ApiKeyRepository.insert(entity);

        return res.status(HttpCode.CREATED).send({
            message: Messages.API_KEY_CREATED,
            entity: { ...entity, value },
        });
    }

    @Delete('/api-key/:uuid')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async deleteApiKey(req: Request, res: Response) {
        const uuid = req.params.uuid;

        const apiKey = await ApiKeyRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            }
        });

        apiKey.setDeletedAt();

        await ApiKeyRepository.save(apiKey);

        return res.status(HttpCode.OK).send({
            message: Messages.API_KEY_DELETED,
            entity: apiKey
        });
    }

    @Put('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async update(req: Request, res: Response) {
        const body = req.body as Partial<SettingsPayload>;

        await Promise.all(
            KEYS
                .filter((key) => body[key] !== undefined)
                .map((key) => SettingRepository.setValue(key, body[key]!))
        );

        return res.status(HttpCode.OK).send({ message: Messages.SETTINGS_UPDATED });
    }
}