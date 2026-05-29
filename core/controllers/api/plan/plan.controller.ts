import { CheckJwt, Controller, Error, Get, Post, Put, Delete } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import Messages from "../../../config/messages";
import { PlanRepository } from "../../../databases/repositories/plan.repository";
import { PlanEntity } from "../../../databases/entities/plan.entity";

const hasValidQuotas = (quotas: PlanEntity["quotas"] | undefined) => {
    if (!quotas) {
        return true;
    }

    return quotas.every((quota) => quota && quota.type && quota.value !== undefined);
};

@Controller("plan")
export default class PlanController {
    @Get("/:uuid")
    @CheckJwt()
    @Error()
    async getDetails(req: Request, res: Response) {
        const { uuid } = req.params;

        const plan = await PlanRepository.findOne({
            where: {
                uuid: Equal(uuid),
            },
            relations: ["quotas"],
        });

        if (!plan) {
            return res.status(HttpCode.NOT_FOUND).send({
                message: Messages.PLAN_NOT_FOUND,
            });
        }

        return res.status(HttpCode.OK).send(plan);
    }

    @Post("/")
    @CheckJwt()
    @Error()
    async create(req: Request, res: Response) {
        const plan = req.body as Partial<PlanEntity>;

        if (!plan || !plan.title || !plan.purchasePrice || !plan.salePrice || !hasValidQuotas(plan.quotas)) {
            return res.status(HttpCode.BAD_REQUEST).send({
                message: Messages.MISSING_PARAMETERS,
            });
        }

        const newPlan = PlanRepository.create(plan);
        newPlan.uniqueKey = await PlanRepository.createKey();
        await PlanRepository.save(newPlan);

        return res.status(HttpCode.CREATED).send(newPlan);
    }

    @Put("/:uuid")
    @CheckJwt()
    @Error()
    async update(req: Request, res: Response) {
        const { uuid } = req.params;
        const plan = req.body as Partial<PlanEntity>;

        if (!hasValidQuotas(plan.quotas)) {
            return res.status(HttpCode.BAD_REQUEST).send({
                message: Messages.MISSING_PARAMETERS,
            });
        }

        const existingPlan = await PlanRepository.findOne({
            where: {
                uuid: Equal(uuid),
            },
            relations: ["quotas"],
        });

        if (!existingPlan) {
            return res.status(HttpCode.NOT_FOUND).send({
                message: Messages.PLAN_NOT_FOUND,
            });
        }

        const newPlan = PlanRepository.merge(existingPlan, plan);
        const updatedNewPlan = await PlanRepository.save(newPlan);

        return res.status(HttpCode.OK).send(updatedNewPlan);
    }

    @Delete("/:uuid")
    @CheckJwt()
    @Error()
    async delete(req: Request, res: Response) {
        const { uuid } = req.params;

        const existingPlan = await PlanRepository.findOne({
            where: {
                uuid: Equal(uuid),
            },
        });

        if (!existingPlan) {
            return res.status(HttpCode.NOT_FOUND).send({
                message: Messages.PLAN_NOT_FOUND,
            });
        }

        await PlanRepository.softRemove(existingPlan);

        return res.status(HttpCode.NO_CONTENT).send();
    }
}
