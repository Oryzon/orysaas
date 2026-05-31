<template>
    <v-dialog v-model="dialog" max-width="500px">
        <template #activator="{ props: activatorProps }">
            <v-badge :content="quotaCount" color="primary" floating>
                <v-btn v-bind="activatorProps" variant="tonal" color="secondary" prepend-icon="mdi-tune-variant" :disabled="props.disabled"
                    >Gestion des quotas</v-btn
                >
            </v-badge>
        </template>

        <template #default>
            <v-card class="quotas-modal-card">
                <v-toolbar color="primary" dark>
                    <v-toolbar-title>Gestion des quotas</v-toolbar-title>
                    <v-toolbar-items>
                        <v-btn icon variant="text" @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text class="pa-5 quotas-modal-content">
                    <div v-if="!plan.quotas?.length" class="empty-state">
                        <v-icon size="22" color="grey-darken-1">mdi-chart-box-outline</v-icon>
                        <span>Aucun quota pour le moment</span>
                    </div>

                    <div class="quota-list">
                        <v-card v-for="(quota, index) in plan.quotas" :key="index" class="quota-item" variant="outlined" rounded="lg">
                            <v-card-text class="pa-4">
                                <div class="quota-item-header">
                                    <div class="quota-item-title">Quota {{ index + 1 }}</div>
                                    <v-btn
                                        icon
                                        size="small"
                                        variant="text"
                                        color="error"
                                        :aria-label="`Supprimer le quota ${index + 1}`"
                                        :loading="isLoading"
                                        :disabled="isLoading"
                                        @click="handleRemoveQuota(index)"
                                    >
                                        <v-icon size="18">mdi-delete</v-icon>
                                    </v-btn>
                                </div>

                                <v-row dense>
                                    <v-col cols="12" sm="7">
                                        <v-select
                                            v-model="quota.type"
                                            :items="quotaTypeOptions"
                                            item-title="title"
                                            item-value="value"
                                            label="Type de quota"
                                            variant="outlined"
                                            density="compact"
                                            hide-details
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        />
                                    </v-col>
                                    <v-col cols="12" sm="5">
                                        <v-text-field
                                            v-model.number="quota.value"
                                            label="Limite"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                            variant="outlined"
                                            density="compact"
                                            type="number"
                                            min="0"
                                            hide-details
                                        />
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </div>

                    <v-btn
                        color="secondary"
                        variant="tonal"
                        prepend-icon="mdi-plus"
                        class="mt-3"
                        :loading="isLoading"
                        :disabled="isLoading"
                        @click="handleAddQuota"
                    >
                        Ajouter un quota
                    </v-btn>
                </v-card-text>

                <v-divider />

                <v-card-actions class="px-5 py-4">
                    <v-spacer />
                    <v-btn color="primary" variant="flat" :loading="isLoading" :disabled="isLoading" @click="handleEdit">Enregistrer</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { Plan } from "~/models/Plan";
import type { Quota } from "~/models/Quota";
import { QuotaType, QuotaTypeLabels } from "~/models/Quota";

const props = defineProps({
    entity: {
        type: Object as () => Partial<Plan>,
        default: () => ({}),
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits<{
    updated: [plan: Partial<Plan>];
}>();

const dialog = ref(false);
const plan = ref<Partial<Plan>>({ quotas: [] });
const quotaCount = computed(() => props.entity?.quotas?.length ?? 0);
const quotaTypeOptions = Object.values(QuotaType).map((value) => ({
    title: QuotaTypeLabels[value],
    value,
}));

watch(dialog, (isOpen) => {
    if (isOpen) {
        plan.value = {
            ...props.entity,
            quotas: (props.entity?.quotas ?? []).map((quota) => ({ ...quota })),
        };
    }
});

const isLoading = computed(() => {
    return false;
});

const handleAddQuota = () => {
    if (!plan.value.quotas) {
        plan.value.quotas = [];
    }

    plan.value.quotas.push({
        type: QuotaType.OTHER,
        value: 0,
    } as Quota);
};

const handleRemoveQuota = (index: number) => {
    if (!plan.value.quotas) {
        return;
    }

    plan.value.quotas.splice(index, 1);
};

const handleEdit = () => {
    emit("updated", plan.value);
    handleClose();
};

const handleClose = () => {
    dialog.value = false;
};
</script>

<style scoped>
.quotas-modal-card {
    overflow: hidden;
}

.quotas-modal-content {
    background: linear-gradient(180deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface-light)) 100%);
}

.quota-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.quota-item {
    border-color: rgba(var(--v-theme-primary), 0.2);
    background: rgba(var(--v-theme-primary), 0.03);
}

.quota-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.quota-item-title {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.empty-state {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(var(--v-theme-on-surface), 0.05);
    color: rgba(var(--v-theme-on-surface), 0.75);
    font-size: 0.9rem;
}
</style>
