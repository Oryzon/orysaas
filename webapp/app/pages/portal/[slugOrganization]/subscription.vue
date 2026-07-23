<template>
    <v-row>
        <v-col md="12">
            <v-card rounded="lg" border flat v-if="isLoading">
                <v-card-text class="text-center py-10">
                    <v-progress-circular indeterminate color="primary" />
                </v-card-text>
            </v-card>

            <v-card rounded="lg" border flat v-else-if="isConfirming">
                <v-card-text class="text-center py-10">
                    <v-progress-circular indeterminate color="primary" class="mb-4" />
                    <div class="text-body-1 font-weight-medium">Confirmation de votre paiement...</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">Ça ne devrait prendre que quelques secondes.</div>
                </v-card-text>
            </v-card>

            <v-card rounded="lg" border flat v-else-if="pollTimedOut">
                <v-card-text class="text-center py-10">
                    <v-icon size="40" color="warning" class="mb-2">mdi-clock-alert-outline</v-icon>
                    <div class="text-body-1 font-weight-medium">Ça prend plus de temps que prévu.</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">Votre paiement est en cours de traitement, actualisez dans quelques instants.</div>
                    <v-btn color="primary" variant="tonal" class="mt-4" @click="fetchSubscription">Actualiser</v-btn>
                </v-card-text>
            </v-card>

            <template v-else-if="subscription">
                <v-card rounded="lg" border flat>
                    <div class="d-flex align-center justify-space-between px-6 pt-6 pb-1">
                        <div>
                            <div class="text-h6 font-weight-bold">Abonnement</div>
                            <div class="text-body-2 text-medium-emphasis mt-1">Le plan actuellement utilisé par votre organisation.</div>
                        </div>

                        <v-chip :color="statusColor" label>{{ SubscriptionStatusLabel[subscription.status] }}</v-chip>
                    </div>

                    <v-divider />

                    <v-card-text class="pa-6">
                        <div class="text-h5 font-weight-bold">{{ subscription.planPrice?.plan?.title }}</div>
                        <div class="text-body-2 text-medium-emphasis mt-1">
                            {{ $price(subscription.planPrice?.sellPrice ?? 0) }} / {{ subscription.planPrice?.billingInterval === BillingInterval.MONTH ? 'mois' : 'an' }}
                        </div>
                    </v-card-text>

                    <v-card-actions class="mt-n2 mr-4 bg-grey-lighten-5 justify-end" v-if="canManage">
                        <v-btn
                            color="primary"
                            variant="tonal"
                            rounded="lg"
                            :loading="api.isLoading('subscription:billing-portal')"
                            :disabled="api.isLoading('subscription:billing-portal')"
                            @click="handleManage"
                        >
                            Gérer mon abonnement
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </template>

            <template v-else>
                <div class="d-flex align-center justify-space-between mb-4">
                    <div>
                        <div class="text-h6 font-weight-bold">Choisissez un abonnement</div>
                        <div class="text-body-2 text-medium-emphasis mt-1">Votre organisation n'a pas encore d'abonnement actif.</div>
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

                            <v-chip v-if="hasYearlyDiscount" color="success" variant="flat" size="small" class="ml-2">Remise</v-chip>
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
                                    <span class="text-body-2"> / {{ selectedInterval === BillingInterval.MONTH ? 'mois' : 'an' }}</span>
                                    <v-chip v-if="priceFor(plan)?.discount" color="success" size="small" class="ml-2">-{{ priceFor(plan)!.discount }}%</v-chip>
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
            </template>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Plan } from "~/models/Plan";
import type { PlanPrice } from "~/models/PlanPrice";
import type { Subscription } from "~/models/Subscription";
import { BillingInterval } from "#shared/billing-interval";
import { SubscriptionStatusLabel } from "#shared/subscription-status";
import { OrganizationMemberRole } from "#shared/organization-roles";

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
const selectedInterval = ref<BillingInterval>(BillingInterval.MONTH);
const isConfirming = ref(false);
const pollTimedOut = ref(false);
const checkingOutPlanPriceUuid = ref<string | null>(null);

const isLoading = computed(() =>
    api.isLoading('subscription:detail') || api.isLoading('plans:public')
);

const statusColor = computed(() => {
    switch (subscription.value?.status) {
        case 'active':
        case 'trialing':
            return 'success';
        case 'past_due':
            return 'warning';
        default:
            return 'error';
    }
});

const priceFor = (plan: Plan): PlanPrice | undefined => {
    return plan.prices?.find((price) => price.billingInterval === selectedInterval.value);
};

const hasYearlyDiscount = computed(() => {
    return plans.value
        .flatMap((plan) => plan.prices ?? [])
        .some((price) => price.billingInterval === BillingInterval.YEAR && (price.discount ?? 0) > 0);
});

const returnUrl = () => `${window.location.origin}/portal/${slugOrganization}/subscription`;

const fetchSubscription = async () => {
    subscription.value = await api.get<Subscription | null>(`/tenant/${slugOrganization}/stripe/subscription`, {
        loadingKey: 'subscription:detail',
        toast: false,
    });

    return subscription.value;
};

const fetchPlans = async () => {
    plans.value = await api.get<Plan[]>('plans/public', {
        loadingKey: 'plans:public',
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

    const res = await api.post<{ url: string }>(`/tenant/${slugOrganization}/stripe/checkout`, {
        planPriceUuid: planPrice.uuid,
        successUrl: `${returnUrl()}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: returnUrl(),
    }, {
        loadingKey: 'subscription:checkout',
        toast: true,
    });

    if (res?.url) {
        window.location.href = res.url;
    } else {
        checkingOutPlanPriceUuid.value = null;
    }
};

const handleManage = async () => {
    const res = await api.post<{ url: string }>(`/tenant/${slugOrganization}/stripe/billing-portal`, {
        returnUrl: returnUrl(),
    }, {
        loadingKey: 'subscription:billing-portal',
        toast: false,
    });

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
    }
});
</script>