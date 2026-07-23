<template>
    <v-row>
        <v-col md="12" class="d-flex justify-end mb-n2">
            <portal-quotas-list
            ></portal-quotas-list>

            <v-btn color="secondary" variant="flat" @click="handleSearch" prepend-icon="mdi-refresh">Rafraîchir</v-btn>
            <v-btn color="primary" variant="flat" to="/portal/plans/create" prepend-icon="mdi-plus" class="ms-2">Créer</v-btn>
        </v-col>
    </v-row>

    <v-row>
        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-data-table
                                :headers="headers"
                                :items="plans"
                                :loading="isLoading"
                                loading-text="Chargement des abonnements en cours."
                                no-data-text="Il n'y a pas d'abonnement."
                                items-per-page="25"
                            >
                                <template v-slot:item.isActive="{ item }">
                                    <v-chip
                                        v-if="item.isActive"
                                        label
                                        append-icon="mdi-check"
                                        color="success"
                                        variant="tonal"
                                        size="small"
                                        class="font-weight-bold"
                                    >
                                        Activé
                                    </v-chip>

                                    <v-chip
                                        v-else
                                        label
                                        append-icon="mdi-close"
                                        color="error"
                                        variant="tonal"
                                        size="small"
                                        class="font-weight-bold"
                                    >
                                        Non activé
                                    </v-chip>
                                </template>

                                <template v-slot:item.createdAt="{ item }">
                                    {{ $date.french(item.createdAt) }}
                                </template>

                                <template v-slot:item.price="{ item }">
                                    <span v-if="!item.prices?.length" class="text-medium-emphasis">Aucun prix</span>

                                    <v-chip
                                        v-for="price in item.prices"
                                        :key="price.uuid"
                                        label
                                        color="success"
                                        prepend-icon="mdi-cash-plus"
                                        class="mr-1"
                                    >
                                        {{ BillingIntervalLabel[price.billingInterval] }} — {{ $price(price.sellPrice) }}
                                    </v-chip>
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <v-btn variant="text" icon color="info" :to="`/portal/plans/${item.uuid}`">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>

                                    <portal-plans-remove
                                        :entity="item"
                                        @removed="removeToPlans"
                                    ></portal-plans-remove>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Plan } from "~/models/Plan";
import { BillingIntervalLabel } from "#shared/billing-interval";

const api = useApi();

useConfigPage("Abonnements");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const isLoading = computed(() => {
    return api.isLoading("plans:list");
});

const headers = computed(() => {
    return [
        { title: "Titre", key: "title" },
        { title: "Est actif ?", key: "isActive" },
        { title: "Date de création", key: "createdAt" },
        { title: "Prix", key: "price" },
        { title: "Actions", key: "actions", align: "end" },
    ];
});

const plans = ref<Array<Plan>>([]);

const handleSearch = async () => {
    plans.value = await api.get<Array<Plan>>("plans", {
        loadingKey: "plans:list",
    });
};

const removeToPlans = async (plan: Plan) => {
    plans.value = plans.value.filter((p) => p.uuid !== plan.uuid);
};
</script>
