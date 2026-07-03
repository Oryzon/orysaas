<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                color="info"
                icon="mdi-pencil"
            ></v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="info">
                    <v-toolbar-title>Modifier le quota</v-toolbar-title>

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
                                    v-model="local.key"
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
                                    v-model="local.period"
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
                                    v-model="local.unit"
                                    hide-details="auto"
                                ></v-select>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-text-field
                                    label="Valeur par défaut"
                                    variant="outlined"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    v-model="local.defaultValue"
                                    hide-details="auto"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n4">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="info"
                        variant="flat"
                        :disabled="!isFormValid || isLoading"
                        @click="handleUpdate"
                    >
                        Enregistrer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { Quota } from "~/models/Quota";
import { QuotaKeyLabel, QuotaPeriodLabel, QuotaUnitLabel } from "#shared/quota";

const props = defineProps<{ entity: Quota }>();
const emit = defineEmits(['updated']);

const api = useApi();
const rules = useValidationRules();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const local = ref<Partial<Quota>>({ ...props.entity });

const isLoading = computed(() => api.isLoading('quota:update'));

watch(dialog, (open) => {
    if (open) {
        local.value = { ...props.entity };
    }
});

const labelKey = computed(() =>
    Object.entries(QuotaKeyLabel).map(([key, label]) => ({ value: key, title: label }))
);

const labelPeriod = computed(() =>
    Object.entries(QuotaPeriodLabel).map(([key, label]) => ({ value: key, title: label }))
);

const labelUnit = computed(() =>
    Object.entries(QuotaUnitLabel).map(([key, label]) => ({ value: key, title: label }))
);

const handleClose = () => {
    dialog.value = false;
};

const handleUpdate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.put<{ entity: Quota }>(`/quota/${props.entity.uuid}`, local.value, {
        loadingKey: 'quota:update',
        toast: true,
    });

    emit('updated', res.entity);
    handleClose();
};
</script>