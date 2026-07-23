import { CheckJwt, Controller, Error, Get, Post, Put, Delete, CheckIsSaasAdmin } from "../../../../decorators";
import { Request, Response } from "express";
import { Equal } from "typeorm";
import HttpCode from "../../../../config/http-code";
import Messages from "../../../../config/messages";
import { PlanPriceRepository } from "../../../../databases/repositories/plan-price.repository";
import { PlanPriceEntity } from "../../../../databases/entities/plan-price.entity";
import { BillingInterval } from "../../../../../shared/billing-interval";
import { attachPlanPriceDiscounts } from "../../../../helpers/plan-price.helper";
import { archiveStripePrice, syncPlanByUuid } from "../../../../helpers/stripe.helper";

@Controller("plan/:uuidPlan/price")
export default class PlanPriceController {

    @Get("/")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async list(req: Request, res: Response) {
        const uuidPlan = req.params.uuidPlan;

        const prices = await PlanPriceRepository.find({
            where: {
                planUuid: Equal(uuidPlan)
            },
        });

        return res
            .status(HttpCode.OK)
            .send(attachPlanPriceDiscounts(prices));
    }

    @Post("/")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async create(req: Request, res: Response) {
        const uuidPlan = req.params.uuidPlan;

        const {
            billingInterval,
            sellPrice,
            purchasePrice,
            trialPeriod,
        } = req.body;

        if (!billingInterval || sellPrice === undefined || sellPrice === null) {
            return res
                .status(HttpCode.BAD_REQUEST)
                .send({
                    message: Messages.MISSING_PARAMETERS
                });
        }

        const existing = await PlanPriceRepository.findOne({
            where: {
                planUuid: Equal(uuidPlan),
                billingInterval: Equal(billingInterval as BillingInterval),
            },
        });

        if (existing) {
            return res
                .status(HttpCode.CONFLICT)
                .send({
                    message: Messages.PLAN_PRICE_ALREADY_EXISTS
                });
        }

        const entity = new PlanPriceEntity();

        entity.planUuid = uuidPlan;
        entity.billingInterval = billingInterval;
        entity.sellPrice = sellPrice;
        entity.purchasePrice = purchasePrice;
        entity.trialPeriod = trialPeriod ?? 0;

        await PlanPriceRepository.insert(entity);

        const stripeSyncError = await syncPlanByUuid(uuidPlan);

        return res.status(HttpCode.CREATED).send({
            message: Messages.PLAN_PRICE_CREATED,
            entity,
            stripeSyncError,
        });
    }

    @Put('/:uuidPlanPrice')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async update(req: Request, res: Response) {
        const uuidPlanPrice = req.params.uuidPlanPrice;
        const uuidPlan = req.params.uuidPlan;

        const {
            billingInterval,
            sellPrice,
            purchasePrice,
            trialPeriod,
        } = req.body;

        const alreadyExist = await PlanPriceRepository.findOne({
            where: {
                planUuid: Equal(uuidPlan),
                billingInterval: Equal(billingInterval as BillingInterval),
            }
        });

        if (alreadyExist && alreadyExist.uuid !== uuidPlanPrice) {
            return res
                .status(HttpCode.CONFLICT)
                .send({
                    message: Messages.PLAN_PRICE_ALREADY_EXISTS
                });
        }

        let entity = await PlanPriceRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidPlanPrice),
                planUuid: Equal(uuidPlan),
            }
        });

        entity.billingInterval = billingInterval;
        entity.sellPrice = sellPrice;
        entity.purchasePrice = purchasePrice;
        entity.trialPeriod = trialPeriod ?? 0;

        await PlanPriceRepository.save(entity);

        const stripeSyncError = await syncPlanByUuid(uuidPlan);

        return res.status(HttpCode.OK).send({
            message: Messages.PLAN_PRICE_UPDATED,
            entity,
            stripeSyncError,
        });
    }

    @Delete("/:uuidPlanPrice")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async delete(req: Request, res: Response) {
        const uuidPlan = req.params.uuidPlan;
        const uuidPlanPrice = req.params.uuidPlanPrice;

        let planPrice = await PlanPriceRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidPlanPrice),
                planUuid: Equal(uuidPlan),
            }
        });

        const stripePriceId = planPrice.stripePriceId;

        planPrice.setDeletedAt();

        await PlanPriceRepository.save(planPrice);

        await archiveStripePrice(stripePriceId);

        return res.status(HttpCode.OK).send({
            message: Messages.PLAN_PRICE_DELETED,
            entity: planPrice
        })
    }
}