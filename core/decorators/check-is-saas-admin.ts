import { Request, Response } from "express";
import { getUserUuid } from "../helpers/request-context.helper";
import { OrganizationRepository } from "../databases/repositories/organization.repository";
import { Equal } from "typeorm";
import { UserRepository } from "../databases/repositories/user.repository";
import HttpCode from "../config/http-code";
import Messages from "../config/messages";

export function CheckIsSaasAdmin() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const res = args[1] as Response;
            const userUuid = getUserUuid();

            const user = await UserRepository.findOneOrFail({
                where: {
                    uuid: Equal(userUuid)
                }
            });

            if (!user.isSaasAdmin) {
                return res
                    .status(HttpCode.FORBIDDEN)
                    .send({
                        message: Messages.PERMISSION_FORBIDDEN
                    });
            }

            return originalMethod.apply(this, args);
        }
    }
}