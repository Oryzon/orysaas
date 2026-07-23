import { Request, Response } from "express";
import Stripe from "stripe";
import { Equal, In } from "typeorm";
import HttpCode from "../config/http-code";
import { getStripeClient, upsertSubscriptionFromStripe } from "../helpers/stripe.helper";
import { OrganizationRepository } from "../databases/repositories/organization.repository";
import { OrganizationMemberRepository } from "../databases/repositories/organization-member.repository";
import { OrganizationMemberRole } from "../../shared/organization-roles";
import { notificationService } from "../services/notification.service";
import type { NotificationTypes } from "../../shared/notification-types";
import Messages from "../config/messages";

function resolveId(value: string | { id: string } | null | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    return typeof value === 'string'
        ? value
        : value.id;
}

async function notifyOrganizationAdmins(organizationUuid: string, type: NotificationTypes): Promise<void> {
    const members = await OrganizationMemberRepository.find({
        where: {
            organizationUuid: Equal(organizationUuid),
            role: In([OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN]),
        },
        relations: {
            organization: true
        }
    });

    for (const member of members) {
        await notificationService.send(
            member.memberUuid,
            type,
            {
                organizationName: member.organization.name
            }
        );
    }
}

export async function handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return res
            .status(HttpCode.BAD_REQUEST)
            .send({ message: Messages.MISSING_SIGNATURE });
    }

    let event: Stripe.Event;
    let stripe: Stripe;

    try {
        stripe = await getStripeClient();
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
        console.log('[Stripe webhook] Signature invalide', error);

        return res
            .status(HttpCode.BAD_REQUEST)
            .send({
                message: Messages.MISSING_SIGNATURE
            });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const subscriptionId = resolveId(session.subscription);

                if (subscriptionId) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const customerId = resolveId(session.customer);
                    const organizationUuid = session.metadata?.organizationUuid;

                    if (organizationUuid && customerId) {
                        await OrganizationRepository.update(
                            { uuid: Equal(organizationUuid) },
                            { stripeCustomerId: customerId },
                        );
                    }

                    const subscription = await upsertSubscriptionFromStripe(
                        stripeSubscription,
                        session.metadata?.organizationUuid,
                        session.metadata?.planPriceUuid,
                    );

                    if (subscription) {
                        await notifyOrganizationAdmins(
                            subscription.organizationUuid,
                            'SUBSCRIPTION_STARTED'
                        );
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);

                if (subscription) {
                    await notifyOrganizationAdmins(
                        subscription.organizationUuid,
                        'SUBSCRIPTION_CANCELED'
                    );
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = resolveId(invoice.parent?.subscription_details?.subscription);

                if (subscriptionId) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                    await upsertSubscriptionFromStripe(stripeSubscription);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = resolveId(invoice.parent?.subscription_details?.subscription);

                if (subscriptionId) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const subscription = await upsertSubscriptionFromStripe(stripeSubscription);

                    if (subscription) {
                        await notifyOrganizationAdmins(
                            subscription.organizationUuid,
                            'PAYMENT_FAILED'
                        );
                    }
                }
                break;
            }
        }
    } catch (error) {
        console.log('[Stripe webhook] Failed to process event', event.type, error);
    }

    return res
        .status(HttpCode.OK)
        .send({ received: true });
}