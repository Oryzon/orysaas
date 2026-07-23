import { CheckIsSaasAdmin, CheckJwt, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { PlanRepository } from "../../../databases/repositories/plan.repository";
import {Equal} from "typeorm";
import { attachPlanPriceDiscounts } from "../../../helpers/plan-price.helper";

@Controller("plans")
export default class PlansController {

    @Get("/")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async list(req: Request, res: Response) {
        const plans = await PlanRepository.find({
            relations: {
                prices: true,
            },
        });

        return res
            .status(HttpCode.OK)
            .send(plans);
    }

    @Get('/public')
    @Error()
    async publicList(req: Request, res: Response) {
        const plans = await PlanRepository.find({
            select: {
                title: true,
                description: true,
                isPopular: true,
                prices: {
                    uuid: true,
                    billingInterval: true,
                    sellPrice: true,
                    trialPeriod: true,
                },
                quotas: {
                    value: true,
                    quota: {
                        key: true,
                        period: true,
                        defaultValue: true
                    }
                }
            },
            where: {
                isActive: Equal(true)
            },
            relations: {
                quotas: {
                    quota: true
                },
                prices: true,
            },
            order: {
                title: 'ASC',
                quotas: {
                    quota: {
                        key: 'ASC'
                    }
                }
            }
        });

        const plansWithDiscount = plans.map((plan) => ({
            ...plan,
            prices: attachPlanPriceDiscounts(plan.prices),
        }));

        return res
            .status(HttpCode.OK)
            .send(plansWithDiscount);
    }
}
