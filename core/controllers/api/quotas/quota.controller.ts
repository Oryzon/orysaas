import { CheckJwt, Controller, Error, Get, Post, Put, Delete, CheckIsSaasAdmin } from "../../../decorators";
import { Request, Response } from "express";
import {QuotaEntity} from "../../../databases/entities/quota.entity";
import {QuotaRepository} from "../../../databases/repositories/quota.repository";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";
import {Equal} from "typeorm";

@Controller('quota')
export default class QuotaController {

    @Post('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async create(req: Request, res: Response) {
        const {
            key,
            period,
            unit,
            defaultValue,
        } = req.body;

        const entity = new QuotaEntity();

        entity.key = key;
        entity.period = period;
        entity.unit = unit;
        entity.defaultValue = defaultValue;

        await QuotaRepository.insert(entity);

        return res.status(HttpCode.OK).send({
            message: Messages.QUOTA_CREATED,
            entity
        });
    }

    @Put('/:uuid')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async update(req: Request, res: Response) {
        const uuid = req.params.uuid;

        const {
            key,
            period,
            unit,
            defaultValue,
        } = req.body;

        let quota = await QuotaRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            }
        });

        quota.key = key;
        quota.period = period;
        quota.unit = unit;
        quota.defaultValue = defaultValue;

        await QuotaRepository.save(quota);

        return res.status(HttpCode.OK).send({
            message: Messages.QUOTA_UPDATED,
            entity: quota,
        })
    }
}