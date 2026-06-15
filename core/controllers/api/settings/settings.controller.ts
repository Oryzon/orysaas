import { CheckJwt, CheckIsSaasAdmin, Controller, Error, Get, Put } from "../../../decorators";
import { Request, Response } from "express";

import { SettingRepository } from "../../../databases/repositories/setting.repository";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";

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
    async list(req: Request, res: Response) {
        const entries = await Promise.all(
            KEYS.map(async (key) => [key, await SettingRepository.getValue(key)])
        );

        return res.status(HttpCode.OK).send(Object.fromEntries(entries));
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

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.SETTINGS_UPDATED
            });
    }
}