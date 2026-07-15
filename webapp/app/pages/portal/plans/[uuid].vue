<template>
    <v-row>
        <v-col :md="uuid === 'create' ? 12 : 7">
            <v-card flat>
                <div class="d-flex align-center justify-space-between px-6 pt-6 pb-1">
                    <div>
                        <div class="text-h6 font-weight-bold">Gestion de l'abonnement</div>
                        <div class="text-body-2 text-medium-emphasis mt-1">Les différentes information de l'offre.</div>
                    </div>

                    <div class="mt-n2 mb-n2">
                        <v-switch
                            inset
                            color="success"
                            :label="plan.isActive ? 'Actif' : 'Inactif'"
                            base-color="error"
                            v-model="plan.isActive"
                        ></v-switch>
                    </div>
                </div>

                <v-divider></v-divider>

                <v-card-text>
                    <v-form
                        ref="form"
                        v-model="isFormValid"
                    >
                        <v-row>
                            <v-col md="12">
                                <v-text-field
                                    v-model="plan.title"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    variant="outlined"
                                    label="Titre"
                                    hide-details="auto"
                                    :rules="[ rules.required() ]"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12" style="height: 300px;" class="mt-n4 mb-16">
                                <client-only>
                                    <quill-editor
                                        toolbar="full"
                                        contentType="html"
                                        v-model:content="plan.description"
                                    ></quill-editor>
                                </client-only>
                            </v-col>

                            <v-col md="6" class="mt-n2">
                                <v-text-field
                                    v-model="plan.purchasePrice"
                                    :step="0.01"
                                    :precision="2"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    variant="outlined"
                                    label="Prix d'achat"
                                    type="number"
                                    prefix="€"
                                    hide-details="auto"
                                ></v-text-field>
                            </v-col>

                            <v-col md="6" class="mt-n2">
                                <v-text-field
                                    v-model="plan.sellPrice"
                                    :step="0.01"
                                    :precision="2"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    variant="outlined"
                                    label="Prix de vente"
                                    type="number"
                                    prefix="€"
                                    hide-details="auto"
                                ></v-text-field>
                            </v-col>

                            <v-col md="4" class="mt-n4">
                                <v-text-field
                                    v-model="plan.trialPeriod"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    variant="outlined"
                                    label="Durée de la période d'essai"
                                    hide-details="auto"
                                ></v-text-field>
                            </v-col>

                            <v-col md="4" offset-md="4">
                                <v-switch
                                    class="mt-n4 float-end mr-2"
                                    inset
                                    color="success"
                                    :label="plan.isPopular ? 'Populaire' : 'Non populaire'"
                                    base-color="error"
                                    v-model="plan.isPopular"
                                ></v-switch>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col v-if="uuid !== 'create'" md="5">
            <v-card flat>
                <div class="px-6 pt-6 pb-1 d-flex align-center justify-space-between">
                    <div>
                        <div class="text-h6 font-weight-bold">Gestion des quotas</div>
                        <div class="text-body-2 text-medium-emphasis mt-1">Ajouter, supprimer, ou modifier des limites de quota.</div>
                    </div>

                    <portal-plans-quotas-add
                        :plan-uuid="plan.uuid"
                        @created="addToQuotas"
                    ></portal-plans-quotas-add>
                </div>

                <v-divider></v-divider>

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-list>
                                <v-list-item v-if="plan.quotas?.length === 0">
                                    <v-list-item>Il n'y a pas de quota sur cet abonnement.</v-list-item>
                                </v-list-item>

                                <v-list-item v-else v-for="planQuota in plan.quotas">
                                    <v-list-item-title>
                                        {{ QuotaKeyLabel[planQuota.quota?.key as QuotaKey] }}
                                    </v-list-item-title>

                                    <v-list-item-subtitle>
                                        <v-chip color="primary" label>{{ planQuota.value ?? planQuota.quota?.defaultValue ?? 'Infini' }}</v-chip> / {{ QuotaUnitLabel[planQuota.quota?.unit as QuotaUnit] }} - Période {{ QuotaPeriodLabel[planQuota.quota?.period as QuotaPeriod].toLowerCase() }}
                                    </v-list-item-subtitle>

                                    <template v-slot:append>
                                        <portal-plans-quotas-edit
                                            :entity="planQuota"
                                            @updated="updateToQuotas"
                                        ></portal-plans-quotas-edit>

                                        <portal-plans-quotas-remove
                                            :entity="planQuota"
                                            @removed="removeToQuotas"
                                        ></portal-plans-quotas-remove>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>

        <v-fab
            class="mr-1 mt-n6"
            absolute
            location="bottom right"
            color="success"
            icon="mdi-content-save"
            @click="handleSave"
        ></v-fab>
    </v-row>
</template>

<script setup lang="ts">
import { type Plan } from "~/models/Plan";
import type {QuotaPlan} from "~/models/QuotaPlan";
import {QuotaKey, QuotaKeyLabel, QuotaPeriod, QuotaPeriodLabel, QuotaUnit, QuotaUnitLabel} from "#shared/quota";

const api = useApi();
const uuid = useRoute().params.uuid as string;

useConfigPage(uuid === 'create' ? "Création d'un abonnement" : "Modification d'un abonnement");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const isLoading = computed(() => {
    return api.isLoading("plans:details") || api.isLoading("plans:save");
});

const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
const plan = ref<Partial<Plan>>({});

const handleSearch = async () => {
    if (uuid !== "create") {
        plan.value = await api.get<Plan>(`plan/${uuid}`, {
            loadingKey: "plans:details",
        });
    }
};

const handleSave = async () => {
    const options = {
        loadingKey: "plans:save",
        toast: true,
    };

    if (uuid === "create") {
        const response = await api.post<{ entity: Plan }>("plan", {
            ...plan.value
        }, options);

        await navigateTo(`/portal/plans/${response.entity.uuid}`);
    } else {
        const response = await api.put<{ entity: Plan }>(`plan/${uuid}`, {
            ...plan.value
        }, options);

        plan.value = response.entity;
    }
};

const addToQuotas = (data: QuotaPlan) => {
    plan.value.quotas?.push(data);
}

const updateToQuotas = (data: QuotaPlan) => {
    if (plan.value.quotas) {
        plan.value.quotas = plan.value.quotas.map((quota) => {
            if (quota.uuid === data.uuid) {
                return data;
            }

            return quota;
        });
    }
}

const removeToQuotas = (data: QuotaPlan) => {
    if (plan.value.quotas) {
        plan.value.quotas = plan.value.quotas.filter((quota) => quota.uuid !== data.uuid);
    }
}
</script>
