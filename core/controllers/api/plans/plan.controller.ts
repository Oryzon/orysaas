import { CheckJwt, Controller, Error, Get, Post, Put, Delete, CheckIsSaasAdmin } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import Messages from "../../../config/messages";
import { PlanRepository } from "../../../databases/repositories/plan.repository";
import { PlanEntity } from "../../../databases/entities/plan.entity";
import { attachPlanPriceDiscounts } from "../../../helpers/plan-price.helper";
import { archiveStripeProduct, syncPlanByUuid } from "../../../helpers/stripe.helper";

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
                },
                prices: true,
            },
        });

        const prices = plan.prices
            ? attachPlanPriceDiscounts(plan.prices)
            : plan.prices;

        return res
            .status(HttpCode.OK)
            .send({ ...plan, prices });
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
            isPopular,
        } = req.body;

        const newPlan = new PlanEntity();

        newPlan.title = title;
        newPlan.slug = await PlanRepository.getSlug(newPlan.title);
        newPlan.description = description;
        newPlan.isActive = !!isActive;
        newPlan.isPopular = isPopular;

        await PlanRepository.insert(newPlan);

        const stripeSyncError = await syncPlanByUuid(newPlan.uuid);

        return res
            .status(HttpCode.CREATED)
            .send({
                message: Messages.PLAN_CREATED,
                entity: newPlan,
                stripeSyncError,
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

        const stripeSyncError = await syncPlanByUuid(updatedNewPlan.uuid);

        return res.status(HttpCode.OK).send({
            message: Messages.PLAN_UPDATED,
            entity: updatedNewPlan,
            stripeSyncError,
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

        await archiveStripeProduct(existingPlan.stripeProductId);

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.PLAN_DELETED,
                entity: existingPlan
            });
    }
}
