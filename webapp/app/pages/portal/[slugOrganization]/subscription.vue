<template>
    <v-row>
        <v-col md="12" v-if="isLoading">
            <v-card rounded="lg" border flat>
                <v-card-text class="text-center py-10">
                    <v-progress-circular indeterminate color="primary" />
                </v-card-text>
            </v-card>
        </v-col>

        <v-col md="12" v-else-if="isConfirming">
            <v-card rounded="lg" border flat>
                <v-card-text class="text-center py-10">
                    <v-progress-circular indeterminate color="primary" class="mb-4" />
                    <div class="text-body-1 font-weight-medium">Confirmation de votre paiement...</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                        Ça ne devrait prendre que quelques secondes.
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col md="12" v-else-if="pollTimedOut">
            <v-card rounded="lg" border flat>
                <v-card-text class="text-center py-10">
                    <v-icon size="40" color="warning" class="mb-2">mdi-clock-alert-outline</v-icon>
                    <div class="text-body-1 font-weight-medium">Ça prend plus de temps que prévu.</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                        Votre paiement est en cours de traitement, actualisez dans quelques instants.
                    </div>
                    <v-btn color="primary" variant="tonal" class="mt-4" @click="fetchSubscription">Actualiser</v-btn>
                </v-card-text>
            </v-card>
        </v-col>

        <template v-else-if="subscription">
            <v-col md="12">
                <v-card rounded="lg" border flat>
                    <v-card-text class="d-flex align-center justify-space-between flex-wrap ga-3 py-3 px-4">
                        <div class="d-flex align-center ga-3">
                            <div>
                                <div class="text-caption text-medium-emphasis">Abonnement actuel</div>
                                <div class="text-subtitle-1 font-weight-bold">
                                    <v-chip :color="statusColor" label size="small">
                                        {{ SubscriptionStatusLabel[subscription.status] }}
                                    </v-chip>

                                    {{ subscription.planPrice?.plan?.title }}
                                </div>
                            </div>
                        </div>

                        <div class="d-flex align-center ga-4">
                            <div class="text-body-2 text-medium-emphasis">
                                {{ $price(subscription.planPrice?.sellPrice ?? 0) }} /
                                {{ subscription.planPrice?.billingInterval === BillingInterval.MONTH ? "mois" : "an" }}
                            </div>

                            <v-btn
                                v-if="canManage"
                                color="primary"
                                variant="tonal"
                                size="small"
                                rounded="lg"
                                :loading="api.isLoading('subscription:billing-portal')"
                                :disabled="api.isLoading('subscription:billing-portal')"
                                @click="handleManage"
                            >
                                Gérer
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col md="6">
                <v-card rounded="lg" border flat class="h-100">
                    <div class="px-4 pt-4 pb-1">
                        <div class="text-subtitle-1 font-weight-bold">Historique de facturation</div>
                        <div class="text-caption text-medium-emphasis mt-1">Vos dernières factures.</div>
                    </div>

                    <v-divider class="mt-3" />

                    <v-list v-if="invoices.length" density="compact" class="py-0">
                        <v-list-item
                            v-for="invoice in invoices"
                            :key="invoice.id"
                            :href="invoice.hostedInvoiceUrl ?? undefined"
                            target="_blank"
                            rel="noopener"
                        >
                            <template v-slot:prepend>
                                <v-icon size="18" color="medium-emphasis">mdi-receipt-text-outline</v-icon>
                            </template>

                            <v-list-item-title class="text-body-2">{{
                                $date.frenchDate(invoice.date)
                            }}</v-list-item-title>
                            <v-list-item-subtitle v-if="invoice.number" class="text-caption">{{
                                invoice.number
                            }}</v-list-item-subtitle>

                            <template v-slot:append>
                                <div class="d-flex align-center ga-2">
                                    <span class="text-body-2 font-weight-medium">{{ $price(invoice.amount) }}</span>
                                    <v-chip :color="invoiceStatusColor(invoice.status)" size="x-small" label>{{
                                        invoiceStatusLabel(invoice.status)
                                    }}</v-chip>
                                </div>
                            </template>
                        </v-list-item>
                    </v-list>

                    <v-card-text v-else class="text-center text-caption text-medium-emphasis py-6">
                        Aucune facture pour le moment.
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col md="6" v-if="usage.length">
                <v-card rounded="lg" border flat class="h-100">
                    <div class="px-4 pt-4 pb-1">
                        <div class="text-subtitle-1 font-weight-bold">Consommation</div>
                        <div class="text-caption text-medium-emphasis mt-1">Votre usage sur la période en cours.</div>
                    </div>

                    <v-divider class="mt-3" />

                    <v-card-text class="px-4 py-4">
                        <div v-for="(item, index) in usage" :key="item.key" :class="{ 'mt-4': index > 0 }">
                            <div class="d-flex align-center justify-space-between mb-1">
                                <span class="text-caption font-weight-medium">{{ QuotaKeyLabel[item.key] }}</span>
                                <span class="text-caption text-medium-emphasis">
                                    {{ item.used }}{{ item.limit !== null ? ` / ${item.limit}` : "" }}
                                    {{ QuotaUnitLabel[item.unit] }}
                                    <template v-if="item.period"> {{ QuotaPeriodPerLabel[item.period] }}</template>
                                    <v-chip v-if="item.limit === null" color="success" size="x-small" class="ml-2"
                                        >Illimité</v-chip
                                    >
                                </span>
                            </div>

                            <v-progress-linear
                                v-if="item.limit !== null"
                                :model-value="usagePercent(item)"
                                :color="usageColor(item)"
                                height="6"
                                rounded
                            />
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </template>

        <v-col md="12" v-else>
            <div class="d-flex align-center justify-space-between mb-4">
                <div>
                    <div class="text-h6 font-weight-bold">Choisissez un abonnement</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                        Votre organisation n'a pas encore d'abonnement actif.
                    </div>
                </div>

                <v-btn-toggle v-model="selectedInterval" mandatory rounded="4px" class="bg-surface-light" divided>
                    <v-btn
                        :value="BillingInterval.MONTH"
                        variant="flat"
                        :class="{ 'gradient-primary': selectedInterval === BillingInterval.MONTH }"
                    >
                        Mensuel
                    </v-btn>

                    <v-btn
                        :value="BillingInterval.YEAR"
                        variant="flat"
                        :class="{ 'gradient-primary': selectedInterval === BillingInterval.YEAR }"
                    >
                        Annuel

                        <v-chip v-if="hasYearlyDiscount" color="success" variant="flat" size="small" class="ml-2"
                            >Remise</v-chip
                        >
                    </v-btn>
                </v-btn-toggle>
            </div>

            <v-row>
                <v-col md="4" v-for="plan in plans" :key="plan.uuid">
                    <v-card rounded="lg" border flat>
                        <v-card-text>
                            <div class="text-h6 font-weight-bold">{{ plan.title }}</div>
                            <div class="text-body-2 text-medium-emphasis" v-html="plan.description"></div>

                            <div class="mt-4" v-if="priceFor(plan)">
                                <span class="text-h4 font-weight-black">{{ $price(priceFor(plan)!.sellPrice) }}</span>
                                <span class="text-body-2">
                                    / {{ selectedInterval === BillingInterval.MONTH ? "mois" : "an" }}</span
                                >
                                <v-chip v-if="priceFor(plan)?.discount" color="success" size="small" class="ml-2"
                                    >-{{ priceFor(plan)!.discount }}%</v-chip
                                >
                            </div>

                            <v-btn
                                v-if="canManage"
                                block
                                class="mt-4"
                                color="primary"
                                rounded="8px"
                                :disabled="!priceFor(plan) || api.isLoading('subscription:checkout')"
                                :loading="checkingOutPlanPriceUuid === priceFor(plan)?.uuid"
                                @click="priceFor(plan) && handleSubscribe(priceFor(plan)!)"
                            >
                                S'abonner
                            </v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Plan } from "~/models/Plan";
import type { PlanPrice } from "~/models/PlanPrice";
import type { Subscription } from "~/models/Subscription";
import type { QuotaUsage } from "~/models/QuotaUsage";
import type { Invoice } from "~/models/Invoice";
import { BillingInterval } from "#shared/billing-interval";
import { SubscriptionStatusLabel } from "#shared/subscription-status";
import { OrganizationMemberRole } from "#shared/organization-roles";
import { QuotaKeyLabel, QuotaUnitLabel, QuotaPeriodPerLabel } from "#shared/quota";

useConfigPage("Abonnement");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const api = useApi();
const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;
const canManage = useOrganizationCan(OrganizationMemberRole.ADMIN);

const plans = ref<Plan[]>([]);
const subscription = ref<Subscription | null>(null);
const usage = ref<QuotaUsage[]>([]);
const invoices = ref<Invoice[]>([]);
const selectedInterval = ref<BillingInterval>(BillingInterval.MONTH);
const isConfirming = ref(false);
const pollTimedOut = ref(false);
const checkingOutPlanPriceUuid = ref<string | null>(null);

const isLoading = computed(() => api.isLoading("subscription:detail") || api.isLoading("plans:public"));

const statusColor = computed(() => {
    switch (subscription.value?.status) {
        case "active":
        case "trialing":
            return "success";
        case "past_due":
            return "warning";
        default:
            return "error";
    }
});

const priceFor = (plan: Plan): PlanPrice | undefined => {
    return plan.prices?.find((price) => price.billingInterval === selectedInterval.value);
};

const usagePercent = (item: QuotaUsage): number => {
    if (!item.limit) {
        return 0;
    }

    return Math.min(100, (item.used / item.limit) * 100);
};

const usageColor = (item: QuotaUsage): string => {
    const percent = usagePercent(item);

    if (percent >= 100) {
        return "error";
    }

    if (percent >= 80) {
        return "warning";
    }

    return "primary";
};

const INVOICE_STATUS_COLOR: Record<string, string> = {
    paid: "success",
    open: "warning",
    uncollectible: "error",
    void: "secondary",
    draft: "secondary",
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
    paid: "Payée",
    open: "En attente",
    uncollectible: "Impayée",
    void: "Annulée",
    draft: "Brouillon",
};

const invoiceStatusColor = (status: Invoice["status"]): string => INVOICE_STATUS_COLOR[status ?? ""] ?? "secondary";
const invoiceStatusLabel = (status: Invoice["status"]): string => INVOICE_STATUS_LABEL[status ?? ""] ?? status ?? "";

const hasYearlyDiscount = computed(() => {
    return plans.value
        .flatMap((plan) => plan.prices ?? [])
        .some((price) => price.billingInterval === BillingInterval.YEAR && (price.discount ?? 0) > 0);
});

const returnUrl = () => `${window.location.origin}/portal/${slugOrganization}/subscription`;

const fetchSubscription = async () => {
    subscription.value = await api.get<Subscription | null>(`/tenant/${slugOrganization}/stripe/subscription`, {
        loadingKey: "subscription:detail",
        toast: false,
    });

    return subscription.value;
};

const fetchUsage = async () => {
    usage.value =
        (await api.get<QuotaUsage[]>(`/tenant/${slugOrganization}/quotas/usage`, {
            loadingKey: "subscription:usage",
            toast: false,
        })) ?? [];
};

const fetchInvoices = async () => {
    invoices.value =
        (await api.get<Invoice[]>(`/tenant/${slugOrganization}/stripe/invoices`, {
            loadingKey: "subscription:invoices",
            toast: false,
        })) ?? [];
};

const fetchPlans = async () => {
    plans.value = await api.get<Plan[]>("plans/public", {
        loadingKey: "plans:public",
        toast: false,
    });
};

const pollForSubscription = async () => {
    isConfirming.value = true;

    for (let attempt = 0; attempt < 15; attempt++) {
        const result = await fetchSubscription();

        if (result) {
            isConfirming.value = false;
            await navigateTo(`/portal/${slugOrganization}/subscription`, { replace: true });
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    isConfirming.value = false;
    pollTimedOut.value = true;
};

const handleSubscribe = async (planPrice: PlanPrice) => {
    checkingOutPlanPriceUuid.value = planPrice.uuid;

    const res = await api.post<{ url: string }>(
        `/tenant/${slugOrganization}/stripe/checkout`,
        {
            planPriceUuid: planPrice.uuid,
            successUrl: `${returnUrl()}?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: returnUrl(),
        },
        {
            loadingKey: "subscription:checkout",
            toast: true,
        },
    );

    if (res?.url) {
        window.location.href = res.url;
    } else {
        checkingOutPlanPriceUuid.value = null;
    }
};

const handleManage = async () => {
    const res = await api.post<{ url: string }>(
        `/tenant/${slugOrganization}/stripe/billing-portal`,
        {
            returnUrl: returnUrl(),
        },
        {
            loadingKey: "subscription:billing-portal",
            toast: false,
        },
    );

    if (res?.url) {
        window.location.href = res.url;
    }
};

onMounted(async () => {
    if (route.query.session_id) {
        await pollForSubscription();

        if (!subscription.value) {
            return;
        }
    } else {
        await fetchSubscription();
    }

    if (!subscription.value) {
        await fetchPlans();
        return;
    }

    await Promise.all([fetchUsage(), fetchInvoices()]);
});
</script>
