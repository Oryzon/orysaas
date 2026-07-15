import { CheckIsSaasAdmin, CheckJwt, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { PlanRepository } from "../../../databases/repositories/plan.repository";
import {Equal} from "typeorm";

@Controller("plans")
export default class PlansController {

    @Get("/")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async list(req: Request, res: Response) {
        const plans = await PlanRepository.find();

        return res.status(HttpCode.OK).send(plans);
    }

    @Get('/public')
    @Error()
    async publicList(req: Request, res: Response) {
        const plans = await PlanRepository.find({
            select: {
                title: true,
                description: true,
                sellPrice: true,
                isPopular: true,
                trialPeriod: true,
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
                }
            },
            order: {
                sellPrice: 'ASC',
                quotas: {
                    quota: {
                        key: 'ASC'
                    }
                }
            }
        });

        return res.status(HttpCode.OK).send(plans);
    }
}
