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
                    <v-toolbar-title>Modifier le quota</v-toolbar-title>

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
                                    label="Quota"
                                    variant="outlined"
                                    hide-details="auto"
                                    :items="quotaItems"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    v-model="local.quotaUuid"
                                ></v-select>
                            </v-col>

                            <v-col cols="12" class="mt-n4">
                                <v-text-field
                                    label="Valeur (optionnelle, sinon valeur par défaut)"
                                    variant="outlined"
                                    hide-details="auto"
                                    type="number"
                                    :disabled="isLoading"
                                    :loading="isLoading"
                                    v-model="local.value"
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
import type { Quota } from "~/models/Quota";
import type { QuotaPlan } from "~/models/QuotaPlan";
import { QuotaKeyLabel, QuotaPeriodLabel } from "#shared/quota";

const props = defineProps<{
    entity: QuotaPlan
}>();
const emit = defineEmits(["updated"]);

const api = useApi();
const rules = useValidationRules();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const quotas = ref<Quota[]>([]);
const local = ref<Partial<QuotaPlan>>({});

const isLoading = computed(() => api.isLoading('plan-quota:edit') || api.isLoading('quotas:list'));

const quotaItems = computed(() =>
    quotas.value.map((q) => ({
        value: q.uuid,
        title: `${QuotaKeyLabel[q.key]}${q.period ? ' — ' + QuotaPeriodLabel[q.period] : ''}`,
    }))
);

watch(dialog, async (open) => {
    if (!open) {
        return;
    }

    quotas.value = await api.get<Quota[]>('/quotas', { loadingKey: 'quotas:list', toast: false });
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

    const res = await api.put<{ entity: QuotaPlan }>(`/plan/${local.value.planUuid}/quota/${local.value.uuid}`,
        local.value,
        {
            loadingKey: 'plan-quota:edit',
            toast: true,
    });

    emit('updated', res.entity);
    handleClose();
};
</script>