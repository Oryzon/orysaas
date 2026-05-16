<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading" v-if="props.entity.isEnabled && props.entity.isRegistered">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                icon
                color="success"
            >
                <v-icon>mdi-play</v-icon>
            </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="isLoading">
                <v-toolbar>
                    <v-toolbar-title>Lancer le job</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="error">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row class="mt-6" v-if="lastRun.input">
                        <v-col
                            md="12"
                            v-for="[key, value] in Object.entries(lastRun.input)"
                            class="mt-n8"
                        >
                            <v-text-field
                                :label="key"
                                variant="outlined"
                                :type="detectType(value)"
                                v-model="nextRunInput[key]"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row v-else>
                        <v-col md="12">
                            <v-alert type="info">
                                Le job n'a pas de paramètre d'entrée, ou il n'a pas encore été lancé au moins une fois.
                            </v-alert>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        @click="handleRun"
                    >Lancer</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type {  JobHistory } from "~/models/JobHistory";
import type { JobSetting } from "~/models/JobSetting";

const api = useApi();
const dialog = ref(false);
const emit = defineEmits(['execute']);

const isLoading = computed(() => {
    return api.isLoading('jobs:last-run');
});

const props = defineProps<{
    entity: JobSetting,
}>();

let lastRun = ref<Partial<JobHistory>>({});

watch(dialog, async (newVal) => {
    if (newVal) {
        lastRun.value = await api.get<JobHistory>(`/job/${props.entity.uuid}/last-run`, {
            loadingKey: 'jobs:last-run',
            toast: false
        });
    }
});

const nextRunInput = ref<Record<string, any>>({});

watch(() => lastRun.value, (run) => {
    if (run?.input) {
        nextRunInput.value = Object.fromEntries(
            Object.keys(run.input).map(key => [key, null])
        );
    }
}, { immediate: true });

const detectType = (value: unknown): 'string' | 'date' | 'number' => {
    if (typeof value === 'number') {
        return 'number';
    }

    if (typeof value === 'string') {
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)?)?$/;

        if (dateRegex.test(value)) {
            return 'date';
        }

        return 'string';
    }

    return 'string';
}

const handleClose = () => {
    dialog.value = false;
}

const handleRun = async () => {
    let res = await api.post(`/job/${props.entity.uuid}/run`,
        { ...nextRunInput.value },
        {
            loadingKey: 'job:run',
            toast: true
        });

    emit("execute", res);
    handleClose();
}
</script>