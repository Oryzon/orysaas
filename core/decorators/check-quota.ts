import { Request, Response } from "express";
import { OrganizationEntity } from "../databases/entities/organization.entity";
import { QuotaKey } from "../../shared/quota";
import { checkQuota, quotaErrorStatus } from "../helpers/quota.helper";

// just a wrapper on checkQuota() for routes that went through
// @CheckOrganizationMember already (needs res.locals.organization set).
// if the org isn't resolved yet, or the quota depends on the body, call
// checkQuota() directly in the handler instead of using this one
export function CheckQuota(key: QuotaKey) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const res = args[1] as Response;
            const organization = res.locals.organization as OrganizationEntity;

            const result = await checkQuota(organization.uuid, key);

            if (!result.allowed) {
                return res.status(quotaErrorStatus(result)).send({
                    message: result.message,
                });
            }

            return originalMethod.apply(this, args);
        };
    };
}
