import { Request, Response } from "express";
import { OrganizationMemberEntity } from "../databases/entities/organization-member.entity";
import { OrganizationMemberRole, ROLE_HIERARCHY } from "../../shared/organization-roles";
import HttpCode from "../config/http-code";
import Messages from "../config/messages";

export function CheckOrganizationRole(minRole: OrganizationMemberRole) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const res = args[1] as Response;

            const member = res.locals.organizationMember as OrganizationMemberEntity | undefined;

            if (!member) {
                return res
                    .status(HttpCode.FORBIDDEN)
                    .send({ message: Messages.ORGANIZATION_ROLE_INSUFFICIENT });
            }

            const memberLevel = ROLE_HIERARCHY.indexOf(member.role);
            const requiredLevel = ROLE_HIERARCHY.indexOf(minRole);

            if (memberLevel < requiredLevel) {
                return res
                    .status(HttpCode.UNPROCESSABLE_ENTITY) // Avoid forbidden, which return the front on login page
                    .send({ message: Messages.ORGANIZATION_ROLE_INSUFFICIENT });
            }

            return originalMethod.apply(this, args);
        };
    };
}