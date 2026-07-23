<template>
    <v-dialog v-model="dialog" max-width="500" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                color="info"
                icon
            >
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="info">
                    <v-toolbar-title>Modifier le prix</v-toolbar-title>

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
                                    v-model="local.billingInterval"
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
                                    v-model="local.sellPrice"
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
                                    v-model="local.purchasePrice"
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
                                    v-model="local.trialPeriod"
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
                        Modifier
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
    entity: PlanPrice
}>();
const emit = defineEmits(["updated"]);

const api = useApi();
const rules = useValidationRules();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const local = ref<Partial<PlanPrice>>({});
const warnIfStripeSyncFailed = useStripeSyncWarning();

const isLoading = computed(() => api.isLoading('plan-price:edit'));

const billingIntervalItems = Object.values(BillingInterval).map((interval) => ({
    value: interval,
    title: BillingIntervalLabel[interval],
}));

watch(dialog, (open) => {
    if (!open) {
        return;
    }

    local.value = { ...props.entity };
});

const handleClose = () => {
    dialog.value = false;
    local.value = {};
};

const handleCreate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.put<{ entity: PlanPrice, stripeSyncError: string | null }>(`/plan/${local.value.planUuid}/price/${local.value.uuid}`,
        local.value,
        {
            loadingKey: 'plan-price:edit',
            toast: true,
    });

    warnIfStripeSyncFailed(res.stripeSyncError);

    emit('updated', res.entity);
    handleClose();
};
</script>