<template>
    <v-row class="mb-4">
        <v-col md="12" class="d-flex justify-end">
            <v-btn color="secondary" variant="flat" @click="handleSearch" prepend-icon="mdi-refresh">Rafraîchir</v-btn>
            <v-btn color="primary" variant="flat" @click="handleCreation" prepend-icon="mdi-plus" class="ms-2">Créer</v-btn>
        </v-col>
    </v-row>
    <v-row>
        <v-col md="12">
            <v-card flat>
                <v-card-text>
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
                            <span class="font-italic text-medium-emphasis text-body-2">
                                {{ french(item.createdAt) }}
                            </span>
                        </template>
                        <template v-slot:item.salePrice="{ item }">
                            <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold"> {{ item.salePrice }} € </v-chip>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <div class="d-flex align-center justify-end ga-2">
                                <portal-plans-edit :entity="item" @updated="handleSearch"></portal-plans-edit>
                                <portal-plans-delete :entity="item" @deleted="handleDelete"></portal-plans-delete>
                            </div>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import type { Plan } from "~/models/Plan";

const api = useApi();
const { french } = useNuxtApp().$date;

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
    let headers = [
        { title: "Titre", key: "title" },
        { title: "Est actif ?", key: "isActive" },
        { title: "Date de création", key: "createdAt" },
        { title: "Prix de vente", key: "salePrice" },
        { title: "Actions", key: "actions", align: "end" },
    ];

    return headers;
});

const plans = ref<Array<Plan>>([]);

const handleSearch = async () => {
    plans.value = await api.get<Array<Plan>>("plans", {
        loadingKey: "plans:list",
    });
};

const handleDelete = async (plan: Plan) => {
    await api.remove(`plans/${plan.uuid}`, {
        toast: true,
        loadingKey: "plans:delete",
    });

    await handleSearch();
};

const handleCreation = async () => {
    await navigateTo("/portal/plans/create");
};
</script>
