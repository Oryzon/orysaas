import { CheckJwt, Controller, Error, Get, Post, Put, Delete, CheckIsSaasAdmin } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import Messages from "../../../config/messages";
import { PlanRepository } from "../../../databases/repositories/plan.repository";
import { PlanEntity } from "../../../databases/entities/plan.entity";

@Controller("plan")
export default class PlanController {

    @Get("/:uuid")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async detail(req: Request, res: Response) {
        const { uuid } = req.params;

        const plan = await PlanRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid),
            },
            relations: {
                quotas: {
                    quota: true,
                }
            },
        });

        return res
            .status(HttpCode.OK)
            .send(plan);
    }

    @Post("/")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async create(req: Request, res: Response) {
        const {
            title,
            description,
            isActive,
            sellPrice,
            purchasePrice
        } = req.body;

        const newPlan = new PlanEntity();

        newPlan.title = title;
        newPlan.slug = await PlanRepository.getSlug(newPlan.title);
        newPlan.description = description;
        newPlan.isActive = !!isActive;
        newPlan.sellPrice = sellPrice;
        newPlan.purchasePrice = purchasePrice;

        await PlanRepository.insert(newPlan);

        return res
            .status(HttpCode.CREATED)
            .send({
                message: Messages.PLAN_CREATED,
                entity: newPlan
            });
    }

    @Put("/:uuid")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async update(req: Request, res: Response) {
        const { uuid } = req.params;
        const plan = req.body as Partial<PlanEntity>;

        const existingPlan = await PlanRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid),
            },
        });

        const newPlan = PlanRepository.merge(existingPlan, plan);
        const updatedNewPlan = await PlanRepository.save(newPlan);

        return res.status(HttpCode.OK).send({
            message: Messages.PLAN_UPDATED,
            entity: updatedNewPlan
        });
    }

    @Delete("/:uuid")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async delete(req: Request, res: Response) {
        const { uuid } = req.params;

        const existingPlan = await PlanRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid),
            },
        });

        existingPlan.setDeletedAt();

        await PlanRepository.save(existingPlan);

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.PLAN_DELETED,
                entity: existingPlan
            });
    }
}
