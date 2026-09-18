import { CheckJwt, CheckOrganizationMember, Controller, Error, Get } from "../../../../decorators";
import { Request, Response } from "express";
import HttpCode from "../../../../config/http-code";
import { OrganizationEntity } from "../../../../databases/entities/organization.entity";
import { getUsageSummary } from "../../../../helpers/quota.helper";

@Controller("/tenant/:slugOrganization/quotas")
export default class TenantQuotasController {
    @Get("/usage")
    @CheckJwt()
    @CheckOrganizationMember()
    @Error()
    async usage(req: Request, res: Response) {
        const organization = res.locals.organization as OrganizationEntity;

        const summary = await getUsageSummary(organization.uuid);

        return res.status(HttpCode.OK).send(summary);
    }
}
