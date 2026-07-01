<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                class="mr-2"
                v-bind="activatorProps"
                variant="flat"
                color="success"
                prepend-icon="mdi-plus"
            >
                Nouveau quota
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="success">
                    <v-toolbar-title>Créer une nouvelle option de quota</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form
                        ref="form"
                        v-model="isFormValid"
                    >
                        <v-row>
                            <v-col md="12">
                                <v-select
                                    label="Clé"
                                    variant="outlined"
                                    :items="labelKey"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    v-model="quota.key"
                                    hide-details="auto"
                                ></v-select>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-select
                                    label="Période"
                                    variant="outlined"
                                    :items="labelPeriod"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    v-model="quota.period"
                                    hide-details="auto"
                                ></v-select>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-select
                                    label="Unité"
                                    variant="outlined"
                                    :items="labelUnit"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    v-model="quota.unit"
                                    hide-details="auto"
                                ></v-select>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-text-field
                                    label="Valeur par défaut"
                                    variant="outlined"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    v-model="quota.defaultValue"
                                    hide-details="auto"
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
                        Créer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { Quota } from "~/models/Quota";
import { QuotaKeyLabel, QuotaPeriodLabel, QuotaUnitLabel } from "#shared/quota";

const api = useApi();
const dialog = ref(false);
const quota = ref<Partial<Quota>>({});
const emit = defineEmits(['created']);

const rules = useValidationRules();
const form = ref();
const isFormValid = ref(false);

const isLoading = computed(() => api.isLoading('quotas:create'));

const labelKey = computed(() => {
    return Object.entries(QuotaKeyLabel).map(([key, label]) => ({
        value: key,
        title: label
    }));
});

const labelPeriod = computed(() => {
    return Object.entries(QuotaPeriodLabel).map(([key, label]) => ({
        value: key,
        title: label
    }));
});

const labelUnit = computed(() => {
    return Object.entries(QuotaUnitLabel).map(([key, label]) => ({
        value: key,
        title: label
    }));
});

const handleClose = () => {
    dialog.value = false;
};

const handleCreate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.post<{ entity: Quota }>(`/quota`, quota.value, {
        loadingKey: 'quota:create',
        toast: true,
    });

    emit('created', res.entity);
    handleClose();
}
</script>