<template>
    <v-container class="py-8 px-4 px-sm-6 px-md-8">
        <v-form>
            <v-card class="mx-auto rounded-xl elevation-3" max-width="860">
                <v-card-title class="d-flex flex-wrap align-center ga-3 px-6 px-sm-8 pt-6 pb-3">
                    <div class="d-flex align-center ga-2">
                        <v-icon color="primary" icon="mdi-file-document-edit-outline" />
                        <span class="text-h6 font-weight-bold">
                            {{ uuid === "create" ? "Nouvel abonnement" : "Modifier l'abonnement" }}
                        </span>
                    </div>
                    <v-spacer />
                    <v-chip :color="plan.isActive ? 'success' : 'grey'" size="small" variant="tonal">
                        {{ plan.isActive ? "Actif" : "Inactif" }}
                    </v-chip>
                </v-card-title>

                <v-divider />

                <v-card-text class="px-6 px-sm-8 py-6">
                    <v-row class="mb-2">
                        <v-col cols="12">
                            <v-text-field
                                v-model="plan.title"
                                :loading="isLoading"
                                :disabled="isLoading"
                                variant="outlined"
                                label="Titre"
                                prepend-inner-icon="mdi-format-title"
                                hide-details="auto"
                            />
                        </v-col>
                    </v-row>

                    <v-row class="mt-3 mb-2">
                        <v-col cols="12">
                            <v-textarea
                                v-model="plan.description"
                                :loading="isLoading"
                                :disabled="isLoading"
                                variant="outlined"
                                label="Description"
                                rows="4"
                                prepend-inner-icon="mdi-text-box-outline"
                                hide-details="auto"
                                auto-grow
                            />
                        </v-col>
                    </v-row>

                    <v-row class="mt-3 mb-2">
                        <v-col cols="12" md="6">
                            <v-number-input
                                v-model="plan.purchasePrice"
                                :step="0.01"
                                :precision="2"
                                :loading="isLoading"
                                :disabled="isLoading"
                                variant="outlined"
                                label="Prix d'achat"
                                type="number"
                                prefix="€"
                                prepend-inner-icon="mdi-cash-minus"
                                hide-details="auto"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-number-input
                                v-model="plan.salePrice"
                                :step="0.01"
                                :precision="2"
                                :loading="isLoading"
                                :disabled="isLoading"
                                variant="outlined"
                                label="Prix de vente"
                                type="number"
                                prefix="€"
                                prepend-inner-icon="mdi-cash-plus"
                                hide-details="auto"
                            />
                        </v-col>
                    </v-row>

                    <v-row class="mt-3 align-center">
                        <v-col cols="12" md="6" class="d-flex align-center">
                            <v-switch
                                v-model="plan.isActive"
                                :loading="isLoading"
                                :disabled="isLoading"
                                color="primary"
                                base-color="grey-darken-1"
                                label="Actif"
                                inset
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="6" class="d-flex justify-start justify-md-end">
                            <portal-plans-quotas-modal :entity="plan" @updated="handleQuotaEdit" :disabled="isLoading" />
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider />

                <v-card-actions class="px-6 px-sm-8 py-4">
                    <v-btn :loading="isLoading" variant="text" class="text-none" @click="handleCancel">Retour</v-btn>
                    <v-spacer />
                    <v-btn
                        color="primary"
                        variant="flat"
                        @click="handleSave"
                        :loading="isLoading"
                        :disabled="isLoading"
                        prepend-icon="mdi-content-save-outline"
                        class="text-none px-6"
                    >
                        Enregistrer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-container>
</template>
<script setup lang="ts">
import { type Plan } from "~/models/Plan";
import type { Quota } from "~/models/Quota";

const api = useApi();
const uuid = useRoute().params.uuid as string;

useConfigPage("Gestion d'abonnement");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const isLoading = computed(() => {
    return api.isLoading("plan:details") || api.isLoading("plan:save");
});

const plan = ref<Partial<Plan>>({});

const handleSearch = async () => {
    if (uuid !== "create") {
        plan.value = await api.get<Plan>(`plan/${uuid}`, {
            loadingKey: "plan:details",
        });
    }
};

const handleQuotaEdit = (updatedPlan: Partial<Plan>) => {
    plan.value = {
        ...plan.value,
        quotas: updatedPlan.quotas ?? [],
    };
};

const buildPlanPayload = (): Partial<Plan> => {
    const quotas: Partial<Quota>[] = (plan.value.quotas ?? []).map((quota) => ({
        uuid: quota.uuid,
        type: quota.type,
        value: Number(quota.value) || 0,
        planUuid: uuid !== "create" ? uuid : quota.planUuid,
    }));

    return {
        ...plan.value,
        quotas,
    };
};

const handleSave = async () => {
    const options = {
        loadingKey: "plan:save",
        toast: true,
    };

    const payload = buildPlanPayload();

    if (uuid === "create") {
        const response = await api.post<Plan>("plan", payload, options);
        await navigateTo(`/portal/plans/${response.uuid}`);
    } else {
        const response = await api.put<Plan>(`plan/${uuid}`, payload, options);
        plan.value = {
            ...response,
            quotas: response.quotas ?? payload.quotas,
        };
    }
};

const handleCancel = async () => {
    await navigateTo("/portal/plans");
};
</script>
