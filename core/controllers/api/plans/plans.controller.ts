import { CheckIsSaasAdmin, CheckJwt, Controller, Error, Get } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import { PlanRepository } from "../../../databases/repositories/plan.repository";

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
}
