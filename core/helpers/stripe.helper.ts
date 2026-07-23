import Stripe from "stripe";
import { Equal } from "typeorm";
import { PlanEntity } from "../databases/entities/plan.entity";
import { PlanPriceEntity } from "../databases/entities/plan-price.entity";
import { OrganizationEntity } from "../databases/entities/organization.entity";
import { SubscriptionEntity } from "../databases/entities/subscription.entity";
import { PlanRepository } from "../databases/repositories/plan.repository";
import { PlanPriceRepository } from "../databases/repositories/plan-price.repository";
import { ApiKeyRepository } from "../databases/repositories/api-key.repository";
import { OrganizationRepository } from "../databases/repositories/organization.repository";
import { OrganizationMemberRepository } from "../databases/repositories/organization-member.repository";
import { SubscriptionRepository } from "../databases/repositories/subscription.repository";
import { OrganizationMemberRole } from "../../shared/organization-roles";
import { SubscriptionStatus } from "../../shared/subscription-status";

export async function getStripeClient(): Promise<Stripe> {
    const secretKey = await ApiKeyRepository.findBySystemKey('STRIPE');

    if (!secretKey) {
        throw new Error("Clé Stripe non configurée (Paramètres > Clés d'API).");
    }

    return new Stripe(secretKey);
}

function resolveStripeId(value: string | { id: string } | null | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    return typeof value === 'string' ? value : value.id;
}

// ---------------------------------------------------------------------------
// Product / Price catalog sync (admin side)
// ---------------------------------------------------------------------------

// A Stripe Price's amount is immutable: if it changed, we archive the old one
// and create a new one rather than trying to update it in place.
async function syncPlanPrice(stripe: Stripe, plan: PlanEntity, price: PlanPriceEntity) {
    const unitAmount = Math.round(price.sellPrice * 100);

    if (!price.stripePriceId) {
        const created = await stripe.prices.create({
            product: plan.stripeProductId!,
            unit_amount: unitAmount,
            currency: 'eur',
            recurring: { interval: price.billingInterval },
            active: price.isActive,
        });

        price.stripePriceId = created.id;
        await PlanPriceRepository.save(price);

        return;
    }

    const existing = await stripe.prices.retrieve(price.stripePriceId);

    if (existing.unit_amount === unitAmount) {
        if (existing.active !== price.isActive) {
            await stripe.prices.update(
                price.stripePriceId, {
                    active: price.isActive
                }
            );
        }

        return;
    }

    await stripe.prices.update(price.stripePriceId, {
        active: false
    });

    const created = await stripe.prices.create({
        product: plan.stripeProductId!,
        unit_amount: unitAmount,
        currency: 'eur',
        recurring: {
            interval: price.billingInterval
        },
        active: price.isActive,
    });

    price.stripePriceId = created.id;

    await PlanPriceRepository.save(price);
}

export async function syncPlan(stripe: Stripe, plan: PlanEntity): Promise<PlanEntity> {
    if (!plan.stripeProductId) {
        const product = await stripe.products.create({
            name: plan.title,
            description: plan.description ?? undefined,
            active: plan.isActive,
        });

        plan.stripeProductId = product.id;
    } else {
        await stripe.products.update(plan.stripeProductId, {
            name: plan.title,
            description: plan.description ?? undefined,
            active: plan.isActive,
        });
    }

    await PlanRepository.save(plan);

    const prices = await PlanPriceRepository.find({
        where: {
            planUuid: Equal(plan.uuid)
        }
    });

    for (const price of prices) {
        await syncPlanPrice(stripe, plan, price);
    }

    plan.prices = prices;

    return plan;
}

// Fetches the plan and syncs it, never throwing — used right after a local save
// so a Stripe outage can't block the admin from saving their catalog.
export async function syncPlanByUuid(planUuid: string): Promise<string | null> {
    try {
        const plan = await PlanRepository.findOneOrFail({
            where: {
                uuid: Equal(planUuid)
            }
        });

        const stripe = await getStripeClient();

        await syncPlan(stripe, plan);

        return null;
    } catch (error) {
        return `La synchronisation Stripe a échoué : ${(error as Error).message}`;
    }
}

export async function archiveStripePrice(stripePriceId: string | null): Promise<void> {
    if (!stripePriceId) {
        return;
    }

    try {
        const stripe = await getStripeClient();

        await stripe.prices.update(stripePriceId, {
            active: false
        });
    } catch (error) {
        console.log('[Stripe] Failed to archive price', stripePriceId, error);
    }
}

export async function archiveStripeProduct(stripeProductId: string | null): Promise<void> {
    if (!stripeProductId) {
        return;
    }

    try {
        const stripe = await getStripeClient();
        await stripe.products.update(stripeProductId, {
            active: false
        });
    } catch (error) {
        console.log('[Stripe] Failed to archive product', stripeProductId, error);
    }
}

// ---------------------------------------------------------------------------
// Customer / Checkout / Billing portal (organization side)
// ---------------------------------------------------------------------------

async function getOrganizationContactEmail(organizationUuid: string): Promise<string | undefined> {
    const owner = await OrganizationMemberRepository.findOne({
        where: {
            organizationUuid: Equal(organizationUuid),
            role: Equal(OrganizationMemberRole.OWNER),
        },
        relations: { member: true },
    });

    if (owner?.member?.email) {
        return owner.member.email;
    }

    const admin = await OrganizationMemberRepository.findOne({
        where: {
            organizationUuid: Equal(organizationUuid),
            role: Equal(OrganizationMemberRole.ADMIN),
        },
        relations: { member: true },
    });

    return admin?.member?.email;
}

export async function getOrCreateStripeCustomer(stripe: Stripe, organization: OrganizationEntity): Promise<string> {
    if (organization.stripeCustomerId) {
        return organization.stripeCustomerId;
    }

    const email = await getOrganizationContactEmail(organization.uuid);

    const customer = await stripe.customers.create({
        name: organization.name,
        email,
        metadata: { organizationUuid: organization.uuid },
    });

    organization.stripeCustomerId = customer.id;
    await OrganizationRepository.save(organization);

    return customer.id;
}

export async function createCheckoutSession(
    stripe: Stripe,
    organization: OrganizationEntity,
    planPrice: PlanPriceEntity,
    successUrl: string,
    cancelUrl: string,
): Promise<Stripe.Checkout.Session> {
    const customerId = await getOrCreateStripeCustomer(stripe, organization);

    const metadata = {
        organizationUuid: organization.uuid,
        planPriceUuid: planPrice.uuid,
    };

    return stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: planPrice.stripePriceId!, quantity: 1 }],
        subscription_data: {
            trial_period_days: planPrice.trialPeriod > 0 ? planPrice.trialPeriod : undefined,
            metadata,
        },
        metadata,
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
}

export async function createBillingPortalSession(
    stripe: Stripe,
    organization: OrganizationEntity,
    returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
    return stripe.billingPortal.sessions.create({
        customer: organization.stripeCustomerId!,
        return_url: returnUrl,
    });
}

// ---------------------------------------------------------------------------
// Webhook processing — Stripe Subscription -> SubscriptionEntity
// ---------------------------------------------------------------------------
const SUBSCRIPTION_STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus | null> = {
    trialing: SubscriptionStatus.TRIALING,
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    unpaid: SubscriptionStatus.UNPAID,
    incomplete: null,
    incomplete_expired: null,
    paused: null,
};

async function resolvePlanPriceUuid(stripePriceId: string | undefined): Promise<string | undefined> {
    if (!stripePriceId) {
        return undefined;
    }

    const planPrice = await PlanPriceRepository.findOne({
        where: {
            stripePriceId: Equal(stripePriceId)
        }
    });

    return planPrice?.uuid;
}

// Upserts by stripeSubscriptionId — safe to call repeatedly with the same event
// (Stripe guarantees at-least-once webhook delivery).
export async function upsertSubscriptionFromStripe(
    stripeSubscription: Stripe.Subscription,
    organizationUuid?: string,
    planPriceUuid?: string,
): Promise<SubscriptionEntity | null> {
    const status = SUBSCRIPTION_STATUS_MAP[stripeSubscription.status];

    if (!status) {
        return null;
    }

    let subscription = await SubscriptionRepository.findOne({
        where: {
            stripeSubscriptionId: Equal(stripeSubscription.id)
        },
    });

    const resolvedOrganizationUuid = organizationUuid
        ?? stripeSubscription.metadata?.organizationUuid
        ?? subscription?.organizationUuid;

    const resolvedPlanPriceUuid = planPriceUuid
        ?? stripeSubscription.metadata?.planPriceUuid
        ?? subscription?.planPriceUuid
        ?? await resolvePlanPriceUuid(stripeSubscription.items.data[0]?.price.id);

    if (!resolvedOrganizationUuid || !resolvedPlanPriceUuid) {
        return null;
    }

    if (!subscription) {
        subscription = new SubscriptionEntity();
        subscription.stripeSubscriptionId = stripeSubscription.id;
    }

    const firstItem = stripeSubscription.items.data[0];

    subscription.stripeCustomerId = resolveStripeId(stripeSubscription.customer)!;
    subscription.organizationUuid = resolvedOrganizationUuid;
    subscription.planPriceUuid = resolvedPlanPriceUuid;
    subscription.status = status;
    subscription.trialEndsAt = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null;

    subscription.currentPeriodStart = firstItem
        ? new Date(firstItem.current_period_start * 1000)
        : null;

    subscription.currentPeriodEnd = firstItem
        ? new Date(firstItem.current_period_end * 1000)
        : null;

    if (status === SubscriptionStatus.CANCELED && !subscription.canceledAt) {
        subscription.canceledAt = new Date();
    }

    await SubscriptionRepository.save(subscription);

    return subscription;
}