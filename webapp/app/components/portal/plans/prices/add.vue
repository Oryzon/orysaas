<template>
    <v-dialog v-model="dialog" max-width="500" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="tonal"
                color="primary"
                icon
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="success">
                    <v-toolbar-title>Ajouter un prix au plan</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form ref="form" v-model="isFormValid">
                        <v-row>
                            <v-col cols="12">
                                <v-select
                                    label="Périodicité"
                                    variant="outlined"
                                    hide-details="auto"
                                    :items="billingIntervalItems"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    v-model="newPlanPrice.billingInterval"
                                ></v-select>
                            </v-col>

                            <v-col cols="6" class="mt-n4">
                                <v-text-field
                                    label="Prix de vente"
                                    variant="outlined"
                                    hide-details="auto"
                                    type="number"
                                    step="0.01"
                                    prefix="€"
                                    :disabled="isLoading"
                                    :loading="isLoading"
                                    :rules="[ rules.required() ]"
                                    v-model="newPlanPrice.sellPrice"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="6" class="mt-n4">
                                <v-text-field
                                    label="Prix d'achat"
                                    variant="outlined"
                                    hide-details="auto"
                                    type="number"
                                    step="0.01"
                                    prefix="€"
                                    :disabled="isLoading"
                                    :loading="isLoading"
                                    v-model="newPlanPrice.purchasePrice"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" class="mt-n4">
                                <v-text-field
                                    label="Durée de la période d'essai (jours)"
                                    variant="outlined"
                                    hide-details="auto"
                                    type="number"
                                    :disabled="isLoading"
                                    :loading="isLoading"
                                    v-model="newPlanPrice.trialPeriod"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n4">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        :disabled="!isFormValid || isLoading"
                        @click="handleCreate"
                    >
                        Ajouter
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { PlanPrice } from "~/models/PlanPrice";
import { BillingInterval, BillingIntervalLabel } from "#shared/billing-interval";

const props = defineProps<{
    planUuid?: string
}>();

const emit = defineEmits(["created"]);

const api = useApi();
const rules = useValidationRules();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const newPlanPrice = ref<Partial<PlanPrice>>({});
const warnIfStripeSyncFailed = useStripeSyncWarning();

const isLoading = computed(() => api.isLoading('plan-price:add'));

const billingIntervalItems = Object.values(BillingInterval).map((interval) => ({
    value: interval,
    title: BillingIntervalLabel[interval],
}));

const handleClose = () => {
    dialog.value = false;
    newPlanPrice.value = {};
};

const handleCreate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.post<{ entity: PlanPrice, stripeSyncError: string | null }>(`/plan/${props.planUuid}/price`, newPlanPrice.value, {
        loadingKey: 'plan-price:add',
        toast: true,
    });

    warnIfStripeSyncFailed(res.stripeSyncError);

    emit('created', res.entity);
    handleClose();
};
</script>