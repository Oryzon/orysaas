import { CheckJwt, Controller, Get, Post, Put, Delete, CheckIsSaasAdmin, Error } from "../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../config/http-code";
import {QuotaRepository} from "../../../databases/repositories/quota.repository";

@Controller("quotas")
export default class QuotasController {

    @Get('/')
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async list(req: Request, res: Response) {
        const quotas = await QuotaRepository.find();

        return res.status(HttpCode.OK).send(quotas);
    }
}