<template>
    <v-dialog v-model="dialog" max-width="1600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                icon
                color="teal"
            >
                <v-icon>mdi-history</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar>
                    <v-toolbar-title>Historique de "{{ entity.name }}"</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="error">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text style="height: 600px; overflow: hidden">
                    <v-row no-gutters style="height: 100%">
                        <v-col md="3" style="height: 100%; overflow-y: auto; border-right: 1px solid rgba(255,255,255,0.1)">
                            <v-list lines="two" select-strategy="single-leaf" v-model:selected="selectedHistoryUuid">
                                <v-list-item
                                    v-for="history in histories"
                                    :key="history.uuid"
                                    :value="history.uuid"
                                >
                                    <template #prepend>
                                        <v-icon :color="history.status === JobHistoryStatus.SUCCESS ? 'success' : history.status === JobHistoryStatus.RUNNING ? 'warning' : 'error'" size="large">
                                            {{ history.status === JobHistoryStatus.SUCCESS ? 'mdi-check-circle' : history.status === JobHistoryStatus.RUNNING ? '' : 'mdi-close-circle' }}
                                        </v-icon>
                                    </template>

                                    <v-list-item-title>
                                        {{ $date.french(history.createdAt) }}
                                    </v-list-item-title>

                                    <v-list-item-subtitle>
                                        Durée : {{ history.duration }}ms
                                    </v-list-item-subtitle>
                                </v-list-item>

                                <v-list-item v-if="!histories.length" disabled>
                                    <v-list-item-title class="text-caption text-medium-emphasis">
                                        Aucune exécution
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-col>

                        <v-col md="9" style="height: 100%; overflow-y: auto; background: #1e1e1e; color: white; font-family: monospace;" class="mt-2">
                            <div v-if="selectedHistory" class="pa-4">
                                <div>Paramètres d'entrées : {{ selectedHistory.input }}</div>

                                <br />

                                <div
                                    v-for="(log, i) in selectedHistory.logs"
                                    :key="i"
                                    :class="{
                                        'text-error': log.level === 'error',
                                        'text-warning': log.level === 'warn',
                                        'text-success': log.level === 'success',
                                        'text-white': log.level === 'info',
                                    }"
                                >
                                    [{{ $date.french(log.timestamp) }}] {{ log.message }}
                                </div>

                                <br />

                                <div>
                                    Données de sortie :<br />
                                    <span v-for="(output, i) in selectedHistory.output">
                                        - {{ i }} : {{ output }} <v-btn v-if="i === 'filename'" @click="downloadFile(output)" density="compact">Télécharger</v-btn>
                                    </span>
                                </div>
                            </div>

                            <div v-else class="d-flex align-center justify-center h-100 text-medium-emphasis">
                                <span class="text-caption text-white">Sélectionne une exécution</span>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { JobSetting } from '~/models/JobSetting';
import { type JobHistory, JobHistoryStatus } from "~/models/JobHistory";

const props = defineProps<{
    entity: JobSetting,
}>();

const emit = defineEmits(['updated']);

const api = useApi();
const dialog = ref(false);
const histories = ref<Array<JobHistory>>([]);

const selectedHistoryUuid = ref<string[]>([]);
const selectedHistory = computed(() =>
    histories.value.find(h => h.uuid === selectedHistoryUuid.value[0])
);

const isLoading = computed(() => api.isLoading('jobs:history'));

watch(dialog, async (newVal) => {
    if (newVal) {
        histories.value = await api.get<Array<JobHistory>>(`/job/${props.entity.uuid}/histories`, {
            loadingKey: 'jobs:history',
            toast: false
        });
    }
});

const handleClose = () => {
    dialog.value = false;
};

const downloadFile = async (fileName: string) => {
    const res = await api.get(`export/${fileName}`);

    // @ts-ignore
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
}
</script>
