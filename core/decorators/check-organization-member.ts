import { Request, Response } from "express";
import { Equal } from "typeorm";
import HttpCode from "../config/http-code";
import Messages from "../config/messages";
import { OrganizationRepository } from "../databases/repositories/organization.repository";
import { OrganizationMemberRepository } from "../databases/repositories/organization-member.repository";
import { getUserUuid } from "../helpers/request-context.helper";

export function CheckOrganizationMember() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const res = args[1] as Response;
            const req = args[0] as Request;

            const slugOrganization = req.params.slugOrganization;

            if (!slugOrganization) {
                return res
                    .status(HttpCode.BAD_REQUEST)
                    .send({
                        message: Messages.ORGANIZATION_SLUG_MISSING
                    });
            }

            const userUuid = getUserUuid();

            const organization = await OrganizationRepository.findOne({
                where: {
                    slug: Equal(slugOrganization)
                }
            });

            if (!organization) {
                return res
                    .status(HttpCode.NOT_FOUND)
                    .send({
                        message: Messages.ORGANIZATION_NOT_FOUND
                    });
            }

            const member = await OrganizationMemberRepository.findOne({
                where: {
                    organizationUuid: Equal(organization.uuid),
                    memberUuid: Equal(userUuid)
                }
            });

            if (!member) {
                return res
                    .status(HttpCode.FORBIDDEN)
                    .send({
                        message: Messages.ORGANIZATION_MEMBER_NOT_FOUND
                    });
            }

            res.locals.organization = organization;
            res.locals.organizationMember = member;

            return originalMethod.apply(this, args);
        }
    }
}