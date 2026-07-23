import { CheckJwt, CheckOrganizationMember, CheckOrganizationRole, Controller, Error, Get, Post } from "../../../../decorators";
import { Request, Response } from "express";
import { Equal } from "typeorm";
import HttpCode from "../../../../config/http-code";
import Messages from "../../../../config/messages";
import { OrganizationMemberRole } from "../../../../../shared/organization-roles";
import { OrganizationEntity } from "../../../../databases/entities/organization.entity";
import { SubscriptionRepository } from "../../../../databases/repositories/subscription.repository";
import { PlanPriceRepository } from "../../../../databases/repositories/plan-price.repository";
import { createBillingPortalSession, createCheckoutSession, getStripeClient } from "../../../../helpers/stripe.helper";

@Controller('/tenant/:slugOrganization/stripe')
export default class TenantStripeController {

    @Get('/subscription')
    @CheckJwt()
    @CheckOrganizationMember()
    @Error()
    async subscription(req: Request, res: Response) {
        const organization = res.locals.organization as OrganizationEntity;

        const subscription = await SubscriptionRepository.findActiveByOrganization(organization.uuid);

        return res
            .status(HttpCode.OK)
            .send(subscription);
    }

    @Post('/checkout')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async checkout(req: Request, res: Response) {
        const organization = res.locals.organization as OrganizationEntity;

        const {
            planPriceUuid,
            successUrl,
            cancelUrl
        } = req.body;

        if (!planPriceUuid || !successUrl || !cancelUrl) {
            return res
                .status(HttpCode.BAD_REQUEST)
                .send({
                    message: Messages.MISSING_PARAMETERS
                });
        }

        const planPrice = await PlanPriceRepository.findOneOrFail({
            where: {
                uuid: Equal(planPriceUuid)
            },
        });

        if (!planPrice.stripePriceId) {
            return res
                .status(HttpCode.BAD_REQUEST)
                .send({
                    message: Messages.SUBSCRIPTION_PLAN_NOT_SYNCED
                });
        }

        const existingSubscription = await SubscriptionRepository.findActiveByOrganization(organization.uuid);

        if (existingSubscription) {
            return res
                .status(HttpCode.CONFLICT)
                .send({
                    message: Messages.SUBSCRIPTION_ALREADY_ACTIVE
                });
        }

        const stripe = await getStripeClient();
        const session = await createCheckoutSession(stripe, organization, planPrice, successUrl, cancelUrl);

        return res
            .status(HttpCode.OK)
            .send({
                url: session.url
            });
    }

    @Post('/billing-portal')
    @CheckJwt()
    @CheckOrganizationMember()
    @CheckOrganizationRole(OrganizationMemberRole.ADMIN)
    @Error()
    async billingPortal(req: Request, res: Response) {
        const organization = res.locals.organization as OrganizationEntity;

        const { returnUrl } = req.body;

        if (!returnUrl) {
            return res
                .status(HttpCode.BAD_REQUEST)
                .send({
                    message: Messages.MISSING_PARAMETERS
                });
        }

        if (!organization.stripeCustomerId) {
            return res
                .status(HttpCode.BAD_REQUEST)
                .send({
                    message: Messages.SUBSCRIPTION_NO_STRIPE_CUSTOMER
                });
        }

        const stripe = await getStripeClient();
        const session = await createBillingPortalSession(stripe, organization, returnUrl);

        return res
            .status(HttpCode.OK)
            .send({
                url: session.url
            });
    }
}