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

                                    <v-col md="12" class="mt-n4 mb-n2">
                                        <span class="text-display-large font-weight-black">{{ $price(plan.sellPrice) }}</span>
                                        <span class="text-title-medium"> / mois</span>
                                    </v-col>

                                    <v-col md="8">
                                        <v-btn
                                            block
                                            :color="plan.isPopular ? 'primary' : 'navbar'"
                                            rounded="8px"
                                            to="login"
                                        >
                                            <span v-if="plan.sellPrice === 0">Commencer gratuitement</span>
                                            <span v-else-if="plan.trialPeriod > 0">Démarrer {{ plan.trialPeriod }}j d'essai</span>
                                            <span v-else>Utiliser cette offre</span>
                                        </v-btn>
                                    </v-col>

                                    <v-col md="12" class="mt-n3" v-if="plan.quotas.length > 0">
                                        <v-divider color="primary" thickness="3"></v-divider>
                                    </v-col>

                                    <v-col md="12" class="mt-n6" v-if="plan.quotas.length > 0">
                                        <p v-for="quota in plan.quotas">
                                            <v-icon color="primary">mdi-check</v-icon>
                                            {{ quota.value ?? quota.quota.defaultValue }}
                                            {{ QuotaKeyLabel[quota.quota?.key as QuotaKey] }}
                                            {{ QuotaPeriodPerLabel[quota.quota.period as QuotaPeriod] }}
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
import { QuotaKey, QuotaKeyLabel, QuotaPeriod, QuotaPeriodPerLabel } from "#shared/quota";

const runtime = useRuntimeConfig();

const { data: plans, pending: isLoading } = await useFetch<{ data: Plan[] }>(
    `${runtime.public.apiBase}plans/public`,
    {
        key: `page:plans`,
    }
);

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