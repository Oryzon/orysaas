<template>
    <div>
        <v-container v-if="isLoading" class="py-10 text-center">
            <v-progress-circular indeterminate />
        </v-container>

        <pages-blocks-hero
            :data="{
            title: 'Simple. Comme votre projet devrait l\'être.',
            subtitle: 'Commencez gratuitement, montez en gamme quand ça décolle. Pas de surprise.'
            }"
        ></pages-blocks-hero>

        <v-row align="center" justify="center" class="mt-n6 mb-8">
            <v-col md="auto">
                <v-btn-toggle v-model="selectedInterval" mandatory rounded="4px" class="bg-surface-light" divided>
                    <v-btn
                        :value="BillingInterval.MONTH"
                        variant="flat"
                        color="primary"
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
            </v-col>
        </v-row>

        <v-row align="center" justify="center">
            <v-col md="11">
                <v-row align="center" justify="center">
                    <v-col md="4" v-for="plan in plans">
                        <div class="plan-wrapper" :class="{ 'with-badge': plan.isPopular }">
                            <div v-if="plan.isPopular" class="most-popular-badge gradient-primary">
                                Le plus populaire
                            </div>
                            <v-card
                                :color="plan.isPopular ? 'navbar' : 'white'"
                                rounded="16px"
                                elevation="1"
                                border="md"
                                flat
                            >
                            <v-card-text>
                                <v-row align="center" justify="center">
                                    <v-col md="12">
                                        <h2>{{ plan.title }}</h2>
                                        <div v-html="plan.description"></div>
                                    </v-col>

                                    <v-col md="12" class="mt-n4 mb-n2" v-if="priceFor(plan)">
                                        <span class="text-display-large font-weight-black">{{ $price(priceFor(plan)!.sellPrice) }}</span>
                                        <span class="text-title-medium"> / {{ selectedInterval === BillingInterval.MONTH ? 'mois' : 'an' }}</span>
                                        <v-chip v-if="priceFor(plan)?.discount" color="success" size="small" class="ml-2">-{{ priceFor(plan)!.discount }}%</v-chip>
                                    </v-col>

                                    <v-col md="8">
                                        <v-btn
                                            block
                                            :color="plan.isPopular ? 'primary' : 'navbar'"
                                            rounded="8px"
                                            to="login"
                                            :disabled="!priceFor(plan)"
                                        >
                                            <span v-if="!priceFor(plan)">Bientôt disponible</span>
                                            <span v-else-if="priceFor(plan)!.sellPrice === 0">Commencer gratuitement</span>
                                            <span v-else-if="priceFor(plan)!.trialPeriod > 0">Démarrer {{ priceFor(plan)!.trialPeriod }}j d'essai</span>
                                            <span v-else>Utiliser cette offre</span>
                                        </v-btn>
                                    </v-col>

                                    <v-col md="12" class="mt-n3" v-if="plan.quotas?.length">
                                        <v-divider color="primary" thickness="3"></v-divider>
                                    </v-col>

                                    <v-col md="12" class="mt-n6" v-if="plan.quotas?.length">
                                        <p v-for="quota in plan.quotas ?? []">
                                            <v-icon color="primary">mdi-check</v-icon>
                                            {{ quota.value ?? quota.quota?.defaultValue }}
                                            {{ QuotaKeyLabel[quota.quota?.key as QuotaKey] }}
                                            {{ QuotaPeriodPerLabel[quota.quota?.period as QuotaPeriod] }}
                                        </p>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                        </div>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import type {Plan} from "~/models/Plan";
import type {PlanPrice} from "~/models/PlanPrice";
import { QuotaKey, QuotaKeyLabel, QuotaPeriod, QuotaPeriodPerLabel } from "#shared/quota";
import { BillingInterval } from "#shared/billing-interval";

const runtime = useRuntimeConfig();

const { data: plans, pending: isLoading } = await useFetch<Plan[]>(
    `${runtime.public.apiBase}plans/public`,
    {
        key: `page:plans`,
    }
);

const selectedInterval = ref<BillingInterval>(BillingInterval.MONTH);

const priceFor = (plan: Plan): PlanPrice | undefined => {
    return plan.prices?.find((price) => price.billingInterval === selectedInterval.value);
};

const hasYearlyDiscount = computed(() => {
    return (plans.value ?? [])
        .flatMap((plan) => plan.prices ?? [])
        .some((price) => price.billingInterval === BillingInterval.YEAR && (price.discount ?? 0) > 0);
});

useSeoMeta({
    title: `Tarifs`,
    description: '',
    ogTitle: 'OrySaas — Votre base de Saas, prête à décoller.',
    ogDescription: 'Auth, paiements, équipes, admin, emails. Tout est déjà branché. Vous n\'écrivez plus que la partie qui rend votre produit unique.',
    ogImage: 'https://orysaas.fr/og-image.jpg',
    ogUrl: 'https://orysaas.fr',
    twitterCard: 'summary_large_image'
});
</script>

<style>
.plan-wrapper {
    position: relative;
}

.plan-wrapper.with-badge {
    padding-top: 16px;
}

.most-popular-badge {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    border-radius: 20px;
    padding: 8px 20px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    font-weight: 700;
    font-size: 0.9rem;
}
</style>