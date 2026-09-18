import { Request, Response } from "express";
import Stripe from "stripe";
import { Equal } from "typeorm";
import HttpCode from "../config/http-code";
import { getStripeClient, upsertSubscriptionFromStripe, upsertInvoiceFromStripe } from "../helpers/stripe.helper";
import { OrganizationRepository } from "../databases/repositories/organization.repository";
import { StripeWebhookEventRepository } from "../databases/repositories/stripe-webhook-event.repository";
import { PlanPriceRepository } from "../databases/repositories/plan-price.repository";
import { notifyOrganizationAdmins, emailOrganizationAdmins } from "../helpers/organization-notify.helper";
import Messages from "../config/messages";
import { DateTime } from "luxon";

function resolveId(value: string | { id: string } | null | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    return typeof value === "string" ? value : value.id;
}

async function getPlanTitle(planPriceUuid: string): Promise<string> {
    const planPrice = await PlanPriceRepository.findOne({
        where: { uuid: Equal(planPriceUuid) },
        relations: { plan: true },
    });

    return planPrice?.plan?.title ?? "";
}

function manageSubscriptionUrl(organizationSlug: string): string {
    return `${process.env.HTTP_URL}/portal/${organizationSlug}/subscription`;
}

export async function handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return res.status(HttpCode.BAD_REQUEST).send({ message: Messages.MISSING_SIGNATURE });
    }

    let event: Stripe.Event;
    let stripe: Stripe;

    try {
        stripe = await getStripeClient();
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
        console.log("[Stripe webhook] Signature invalide", error instanceof Error ? error.message : error);

        return res.status(HttpCode.BAD_REQUEST).send({
            message: Messages.MISSING_SIGNATURE,
        });
    }

    const isNewEvent = await StripeWebhookEventRepository.markProcessed(event.id, event.type);

    if (!isNewEvent) {
        console.log("[Stripe webhook] Event already processed, skipping", event.id, event.type);

        return res.status(HttpCode.OK).send({ received: true });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
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
                        await notifyOrganizationAdmins(subscription.organizationUuid, "SUBSCRIPTION_STARTED");

                        const organization = await OrganizationRepository.findOne({
                            where: { uuid: Equal(subscription.organizationUuid) },
                        });

                        if (organization) {
                            const firstItem = stripeSubscription.items.data[0];

                            await emailOrganizationAdmins(
                                organization.uuid,
                                "subscription-started",
                                `Abonnement confirmé pour ${organization.name}`,
                                {
                                    organizationName: organization.name,
                                    planTitle: await getPlanTitle(subscription.planPriceUuid),
                                    price: firstItem
                                        ? new Intl.NumberFormat("fr-FR", {
                                              style: "currency",
                                              currency: firstItem.price.currency,
                                          }).format((firstItem.price.unit_amount ?? 0) / 100)
                                        : "",
                                    billingIntervalLabel:
                                        firstItem?.price.recurring?.interval === "year" ? "/ an" : "/ mois",
                                    manageUrl: manageSubscriptionUrl(organization.slug),
                                },
                            );
                        }
                    }
                }
                break;
            }

            case "customer.subscription.updated": {
                await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);

                if (subscription) {
                    await notifyOrganizationAdmins(subscription.organizationUuid, "SUBSCRIPTION_CANCELED");

                    const organization = await OrganizationRepository.findOne({
                        where: { uuid: Equal(subscription.organizationUuid) },
                    });

                    if (organization) {
                        await emailOrganizationAdmins(
                            organization.uuid,
                            "subscription-cancelled",
                            `Abonnement annulé pour ${organization.name}`,
                            {
                                organizationName: organization.name,
                                planTitle: await getPlanTitle(subscription.planPriceUuid),
                                cancelDate: DateTime.now().setLocale("fr").toLocaleString(DateTime.DATE_FULL),
                                resubscribeUrl: manageSubscriptionUrl(organization.slug),
                            },
                        );
                    }
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = resolveId(invoice.parent?.subscription_details?.subscription);

                if (subscriptionId) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const subscription = await upsertSubscriptionFromStripe(stripeSubscription);

                    if (subscription) {
                        await upsertInvoiceFromStripe(invoice, subscription.organizationUuid);

                        const organization = await OrganizationRepository.findOne({
                            where: { uuid: Equal(subscription.organizationUuid) },
                        });

                        if (organization) {
                            await emailOrganizationAdmins(
                                organization.uuid,
                                "invoice",
                                `Votre facture ${organization.name}`,
                                {
                                    organizationName: organization.name,
                                    planTitle: await getPlanTitle(subscription.planPriceUuid),
                                    invoiceNumber: invoice.number ?? invoice.id,
                                    date: DateTime.fromSeconds(invoice.created)
                                        .setLocale("fr")
                                        .toLocaleString(DateTime.DATE_FULL),
                                    amount: new Intl.NumberFormat("fr-FR", {
                                        style: "currency",
                                        currency: invoice.currency,
                                    }).format((invoice.amount_paid ?? 0) / 100),
                                    hostedInvoiceUrl:
                                        invoice.hosted_invoice_url ?? manageSubscriptionUrl(organization.slug),
                                },
                            );
                        }
                    }
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = resolveId(invoice.parent?.subscription_details?.subscription);

                if (subscriptionId) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const subscription = await upsertSubscriptionFromStripe(stripeSubscription);

                    if (subscription) {
                        await upsertInvoiceFromStripe(invoice, subscription.organizationUuid);
                        await notifyOrganizationAdmins(subscription.organizationUuid, "PAYMENT_FAILED");

                        const organization = await OrganizationRepository.findOne({
                            where: { uuid: Equal(subscription.organizationUuid) },
                        });

                        if (organization) {
                            await emailOrganizationAdmins(
                                organization.uuid,
                                "payment-failed",
                                `Échec de paiement pour ${organization.name}`,
                                {
                                    organizationName: organization.name,
                                    planTitle: await getPlanTitle(subscription.planPriceUuid),
                                    manageUrl: manageSubscriptionUrl(organization.slug),
                                },
                            );
                        }
                    }
                }
                break;
            }

            default:
                console.log("[Stripe webhook] Unhandled event type", event.type);
        }
    } catch (error) {
        console.log(
            "[Stripe webhook] Failed to process event",
            event.type,
            error instanceof Error ? error.message : error,
        );
    }

    return res.status(HttpCode.OK).send({ received: true });
}
