import { CheckJwt, Controller, Error, Get, Post, Put, Delete, CheckIsSaasAdmin } from "../../../../decorators";
import { Request, Response } from "express";
import {PlanRepository} from "../../../../databases/repositories/plan.repository";
import {Equal} from "typeorm";
import HttpCode from "../../../../config/http-code";
import Messages from "../../../../config/messages";
import {QuotaPlanRepository} from "../../../../databases/repositories/quota-plan.repository";
import {QuotaPlanEntity} from "../../../../databases/entities/quota-plan.entity";
import {QuotaRepository} from "../../../../databases/repositories/quota.repository";

@Controller("plan/:uuidPlan/quota")
export default class PlanQuotaController {

    @Post("/")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async create(req: Request, res: Response) {
        const uuidPlan = req.params.uuidPlan;

        const {
            quotaUuid,
            value
        } = req.body;

        if (!quotaUuid) {
            return res.status(HttpCode.BAD_REQUEST).send({ message: Messages.MISSING_PARAMETERS });
        }

        const existing = await QuotaPlanRepository.findOne({
            where: {
                planUuid: Equal(uuidPlan),
                quotaUuid: Equal(quotaUuid)
            },
        });

        if (existing) {
            return res
                .status(HttpCode.CONFLICT)
                .send({
                    message: Messages.QUOTA_PLAN_ALREADY_EXISTS
                });
        }

        const entity = new QuotaPlanEntity();

        entity.planUuid = uuidPlan;
        entity.quota = await QuotaRepository.findOneOrFail({
            where: {
                uuid: Equal(quotaUuid),
            }
        });
        entity.value = value ?? null;

        await QuotaPlanRepository.insert(entity);

        return res.status(HttpCode.CREATED).send({
            message: Messages.QUOTA_PLAN_CREATED,
            entity,
        });
    }

    @Put('/:uuidQuotaPlan')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async update(req: Request, res: Response) {
        const uuidQuotaPlan = req.params.uuidQuotaPlan;
        const uuidPlan = req.params.uuidPlan;

        const {
            quotaUuid,
            value
        } = req.body;

        const alreadyExist = await QuotaPlanRepository.findOne({
            where: {
                planUuid: Equal(uuidPlan),
                quotaUuid: Equal(quotaUuid)
            }
        });

        if (alreadyExist && alreadyExist.uuid !== uuidQuotaPlan) {
            return res
                .status(HttpCode.CONFLICT)
                .send({
                    message: Messages.QUOTA_PLAN_ALREADY_EXISTS
                });
        }

        let entity = await QuotaPlanRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidQuotaPlan),
                planUuid: Equal(uuidPlan)
            }
        });

        entity.quota = await QuotaRepository.findOneOrFail({
            where: {
                uuid: Equal(quotaUuid),
            }
        });
        entity.value = value ?? null;

        await QuotaPlanRepository.save(entity);

        return res.status(HttpCode.CREATED).send({
            message: Messages.QUOTA_PLAN_UPDATED,
            entity,
        });
    }

    @Delete("/:uuidQuotaPlan")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async delete(req: Request, res: Response) {
        const uuidPlan = req.params.uuidPlan;
        const uuidQuotaPlan = req.params.uuidQuotaPlan;

        let quotaPlan = await QuotaPlanRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidQuotaPlan),
                planUuid: Equal(uuidPlan),
            }
        });

        quotaPlan.setDeletedAt();

        await QuotaPlanRepository.save(quotaPlan);

        return res.status(HttpCode.OK).send({
            message: Messages.QUOTA_PLAN_DELETED,
            entity: quotaPlan
        })
    }
}