<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading" v-if="props.entity.isRegistered">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                icon
                color="info"
            >
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar>
                    <v-toolbar-title>Modifier "{{ entity.name }}"</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="error">mdi-close</v-icon>
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
                                <v-text-field
                                    variant="outlined"
                                    v-model="job.expression"
                                    label="Expression cron"
                                    placeholder="0 0 * * *"
                                    :rules="[ rules.required() ]"
                                    hint="Format : minute, heure, jour, mois, jour-semaine."
                                    persistent-hint
                                ></v-text-field>
                            </v-col>

                            <v-col md="12" class="mt-n6">
                                <v-alert
                                    v-if="readableExpression"
                                    class="mt-3"
                                    type="info"
                                    variant="tonal"
                                    density="compact"
                                    :text="readableExpression"
                                ></v-alert>

                                <v-alert
                                    v-else
                                    class="mt-3"
                                    type="error"
                                    variant="tonal"
                                    density="compact"
                                    text="Expression cron invalide"
                                ></v-alert>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-switch
                                    v-model="job.isEnabled"
                                    label="Job actif"
                                    color="primary"
                                    inset
                                    hide-details
                                />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-spacer />

                    <v-btn
                        color="success"
                        variant="flat"
                        :disabled="!isFormValid"
                        @click="handleUpdate"
                    >
                        Modifier
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import cronstrue from 'cronstrue/i18n';
import type { JobSetting } from '~/models/JobSetting';

const props = defineProps<{
    entity: JobSetting,
}>();

const emit = defineEmits(['updated']);

const api = useApi();
const rules  = useValidationRules();

const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);

const job = ref<Partial<JobSetting>>({});

watch(dialog, async (newVal) => {
    job.value = {...props.entity};
});

const readableExpression = computed(() => {
    try {
        return cronstrue.toString(job.value.expression, { locale: 'fr' });
    } catch {
        return null;
    }
});

const isLoading = computed(() => api.isLoading('jobs:edit'));

const handleClose = () => {
    dialog.value = false;
};

const handleUpdate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.put<{ message: string, entity: JobSetting }>(
        `job/${props.entity.uuid}`,
        { ...job.value },
        { loadingKey: 'jobs:edit', toast: true }
    );

    emit('updated', res.entity);
    handleClose();
};
</script>
