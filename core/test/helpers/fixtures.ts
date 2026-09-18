import { Equal } from "typeorm";
import { UserRepository } from "../../build/core/databases/repositories/user.repository";
import { OrganizationRepository } from "../../build/core/databases/repositories/organization.repository";
import { OrganizationMemberRepository } from "../../build/core/databases/repositories/organization-member.repository";
import { PlanRepository } from "../../build/core/databases/repositories/plan.repository";
import { PlanPriceRepository } from "../../build/core/databases/repositories/plan-price.repository";
import { ApiKeyRepository } from "../../build/core/databases/repositories/api-key.repository";
import { SubscriptionRepository } from "../../build/core/databases/repositories/subscription.repository";
import { QuotaRepository } from "../../build/core/databases/repositories/quota.repository";
import { QuotaPlanRepository } from "../../build/core/databases/repositories/quota-plan.repository";
import { UserEntity, UserOrigin } from "../../build/core/databases/entities/user.entity";
import { OrganizationEntity } from "../../build/core/databases/entities/organization.entity";
import {
    OrganizationMemberEntity,
    OrganizationMemberRole,
} from "../../build/core/databases/entities/organization-member.entity";
import { PlanEntity } from "../../build/core/databases/entities/plan.entity";
import { PlanPriceEntity } from "../../build/core/databases/entities/plan-price.entity";
import { ApiKeyEntity, ApiKeyType } from "../../build/core/databases/entities/api-key.entity";
import { SubscriptionEntity } from "../../build/core/databases/entities/subscription.entity";
import { QuotaEntity } from "../../build/core/databases/entities/quota.entity";
import { QuotaPlanEntity } from "../../build/core/databases/entities/quota-plan.entity";
import { BillingInterval } from "../../build/shared/billing-interval";
import { SubscriptionStatus } from "../../build/shared/subscription-status";
import { QuotaKey, QuotaPeriod, QuotaUnit } from "../../build/shared/quota";
import { encrypt } from "../../build/core/helpers/crypto.helper";
import { TokenRepository } from "../../build/core/databases/repositories/token.repository";
import { TokenType } from "../../build/core/databases/entities/token.entity";
import { OrganizationInviteRepository } from "../../build/core/databases/repositories/organization-invite.repository";
import { OrganizationInviteEntity } from "../../build/core/databases/entities/organization-invite.entity";
import { ContactRepository } from "../../build/core/databases/repositories/contact.repository";
import { ContactEntity } from "../../build/core/databases/entities/contact.entity";
import { PageRepository } from "../../build/core/databases/repositories/page.repository";
import { PageEntity } from "../../build/core/databases/entities/page.entity";
import { MenuRepository } from "../../build/core/databases/repositories/menu.repository";
import { MenuEntity } from "../../build/core/databases/entities/menu.entity";
import { NotificationRepository } from "../../build/core/databases/repositories/notification.repository";
import { NotificationEntity } from "../../build/core/databases/entities/notification.entity";
import type { NotificationTypes } from "../../build/shared/notification-types";
import { JobHistoryRepository } from "../../build/core/databases/repositories/job-history.repository";
import { JobHistoryEntity, JobHistoryStatus } from "../../build/core/databases/entities/job-history.entity";
import { JobSettingRepository } from "../../build/core/databases/repositories/job-setting.repository";
import { JobSettingEntity } from "../../build/core/databases/entities/job-setting.entity";
import { QuotaUsageRepository } from "../../build/core/databases/repositories/quota-usage.repository";
import { QuotaUsageEntity } from "../../build/core/databases/entities/quota-usage.entity";

let counter = 0;

function unique(prefix: string): string {
    counter += 1;
    return `${prefix}-${Date.now()}-${counter}`;
}

export async function createUser(
    overrides: Partial<
        Pick<UserEntity, "email" | "password" | "isActive" | "firstname" | "lastname" | "isSaasAdmin" | "origin">
    > = {},
): Promise<UserEntity> {
    const user = new UserEntity();

    user.email = overrides.email ?? `${unique("user")}@example.test`;
    user.password = overrides.password ?? "password123";
    user.hashPassword();
    user.isActive = overrides.isActive ?? true;
    user.firstname = overrides.firstname ?? "Test";
    user.lastname = overrides.lastname ?? "User";
    user.isSaasAdmin = overrides.isSaasAdmin ?? false;
    user.origin = overrides.origin ?? UserOrigin.LOCAL;

    return UserRepository.save(user);
}

export async function createOrganization(
    overrides: Partial<Pick<OrganizationEntity, "name" | "slug">> = {},
): Promise<OrganizationEntity> {
    const org = new OrganizationEntity();

    org.name = overrides.name ?? unique("Org");
    org.slug = overrides.slug ?? unique("org");
    org.address = "1 rue de Test";
    org.city = "Paris";
    org.postalCode = "75000";
    org.country = "FR";

    return OrganizationRepository.save(org);
}

export async function createMembership(
    user: UserEntity,
    organization: OrganizationEntity,
    role: OrganizationMemberRole = OrganizationMemberRole.MEMBER,
): Promise<OrganizationMemberEntity> {
    const member = new OrganizationMemberEntity();

    member.organizationUuid = organization.uuid;
    member.memberUuid = user.uuid;
    member.role = role;

    return OrganizationMemberRepository.save(member);
}

export function issueJwt(user: UserEntity): string {
    return UserRepository.generateJwtToken(user);
}

export async function createPlan(): Promise<PlanEntity> {
    const plan = new PlanEntity();
    plan.title = unique("Plan");
    plan.slug = unique("plan");
    plan.isActive = true;

    return PlanRepository.save(plan);
}

export async function createPlanPrice(): Promise<PlanPriceEntity> {
    const plan = await createPlan();

    const price = new PlanPriceEntity();
    price.plan = plan;
    price.planUuid = plan.uuid;
    price.billingInterval = BillingInterval.MONTH;
    price.sellPrice = 10;
    price.purchasePrice = 5;

    return PlanPriceRepository.save(price);
}

export async function createQuota(key: QuotaKey, period: QuotaPeriod): Promise<QuotaEntity> {
    const existing = await QuotaRepository.findOne({ where: { key: Equal(key), period: Equal(period) } });

    if (existing) {
        return existing;
    }

    const quota = new QuotaEntity();
    quota.key = key;
    quota.unit = QuotaUnit.NUMBER;
    quota.period = period;
    quota.defaultValue = null;

    return QuotaRepository.save(quota);
}

export async function createSubscription(
    organization: OrganizationEntity,
    planPrice: PlanPriceEntity,
    overrides: Partial<
        Pick<SubscriptionEntity, "status" | "trialEndsAt" | "trialEndingNotifiedAt" | "currentPeriodEnd">
    > = {},
): Promise<SubscriptionEntity> {
    const subscription = new SubscriptionEntity();
    subscription.stripeSubscriptionId = unique("sub");
    subscription.stripeCustomerId = unique("cus");
    subscription.organizationUuid = organization.uuid;
    subscription.planPriceUuid = planPrice.uuid;
    subscription.status = overrides.status ?? SubscriptionStatus.ACTIVE;
    subscription.trialEndsAt = overrides.trialEndsAt ?? null;
    subscription.trialEndingNotifiedAt = overrides.trialEndingNotifiedAt ?? null;
    subscription.currentPeriodEnd = overrides.currentPeriodEnd ?? null;

    return SubscriptionRepository.save(subscription);
}

// Sets up what checkQuota()/incrementUsage() need: org, active subscription,
// plan with a limit on `key`.
export async function setupOrganizationWithQuota(
    key: QuotaKey,
    period: QuotaPeriod,
    limit: number,
): Promise<{ organization: OrganizationEntity }> {
    const organization = await createOrganization();
    const planPrice = await createPlanPrice();

    await createSubscription(organization, planPrice);

    const quota = await createQuota(key, period);

    const quotaPlan = new QuotaPlanEntity();
    quotaPlan.quotaUuid = quota.uuid;
    quotaPlan.planUuid = planPrice.planUuid;
    quotaPlan.value = limit;
    await QuotaPlanRepository.save(quotaPlan);

    return { organization };
}

export async function issueToken(user: UserEntity, type: TokenType, hoursValidity: number = 24) {
    return TokenRepository.createToken(user, type, hoursValidity);
}

export async function createInvite(
    organization: OrganizationEntity,
    email: string,
    role: OrganizationMemberRole = OrganizationMemberRole.MEMBER,
    overrides: { acceptedAt?: Date | null; expiresAt?: Date } = {},
): Promise<OrganizationInviteEntity> {
    const invite = new OrganizationInviteEntity();

    invite.organizationUuid = organization.uuid;
    invite.email = email;
    invite.role = role;
    invite.token = unique("invite-token");
    invite.expiresAt = overrides.expiresAt ?? new Date(Date.now() + 72 * 60 * 60 * 1000);
    invite.acceptedAt = overrides.acceptedAt ?? null;

    return OrganizationInviteRepository.save(invite);
}

export async function createContact(
    overrides: Partial<Pick<ContactEntity, "email" | "subject" | "message">> = {},
): Promise<ContactEntity> {
    const contact = new ContactEntity();

    contact.firstname = "Test";
    contact.lastname = "Contact";
    contact.email = overrides.email ?? `${unique("contact")}@example.test`;
    contact.subject = overrides.subject ?? "Question";
    contact.message = overrides.message ?? "Bonjour, j'ai une question.";

    return ContactRepository.save(contact);
}

export async function createPage(
    overrides: Partial<Pick<PageEntity, "slug" | "title" | "isPublished">> = {},
): Promise<PageEntity> {
    const page = new PageEntity();

    page.slug = overrides.slug ?? unique("page");
    page.title = overrides.title ?? "Test page";
    page.metaTitle = "Test page";
    page.metaDescription = "A page used in tests.";
    page.isPublished = overrides.isPublished ?? true;

    return PageRepository.save(page);
}

export async function createMenu(
    overrides: Partial<Pick<MenuEntity, "key" | "label" | "isActive">> = {},
): Promise<MenuEntity> {
    const menu = new MenuEntity();

    menu.key = overrides.key ?? unique("menu");
    menu.label = overrides.label ?? "Test menu";
    menu.isActive = overrides.isActive ?? true;

    return MenuRepository.save(menu);
}

export async function createNotification(
    user: UserEntity,
    overrides: { readAt?: Date | null } = {},
): Promise<NotificationEntity> {
    const notification = new NotificationEntity();

    notification.userUuid = user.uuid;
    notification.type = "EXAMPLE_TEST" as NotificationTypes;
    notification.payload = {};
    notification.actions = null;
    notification.readAt = overrides.readAt ?? null;

    return NotificationRepository.save(notification);
}

export async function createJobHistoryLog(): Promise<JobHistoryEntity> {
    // jobUuid is a real FK to job_setting_entity. Needs an actual row,
    // not just any uuid-shaped string.
    const jobSetting = new JobSettingEntity();
    jobSetting.name = unique("job");
    await JobSettingRepository.save(jobSetting);

    const log = new JobHistoryEntity();
    log.jobUuid = jobSetting.uuid;
    log.status = JobHistoryStatus.RUNNING;

    return JobHistoryRepository.save(log);
}

export async function createQuotaUsage(
    organization: OrganizationEntity,
    key: QuotaKey,
    periodStart: Date,
    periodEnd: Date,
    value: number = 1,
): Promise<QuotaUsageEntity> {
    const usage = new QuotaUsageEntity();
    usage.organizationUuid = organization.uuid;
    usage.quotaKey = key;
    usage.periodStart = periodStart;
    usage.periodEnd = periodEnd;
    usage.value = value;

    return QuotaUsageRepository.save(usage);
}

export async function seedStripeApiKey(): Promise<void> {
    const existing = await ApiKeyRepository.findOne({
        where: { systemKey: "STRIPE" },
    });

    if (existing) {
        return;
    }

    const apiKey = new ApiKeyEntity();
    apiKey.label = "Stripe (test)";
    apiKey.type = ApiKeyType.INTEGRATION;
    apiKey.systemKey = "STRIPE";
    apiKey.value = encrypt("sk_test_dummy_key");

    await ApiKeyRepository.save(apiKey);
}
