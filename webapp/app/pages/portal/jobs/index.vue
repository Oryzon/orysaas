<template>
    <v-row>
        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <v-data-table
                        :headers="headers"
                        :items="jobs"
                        :loading="isLoading"
                        loading-text="Chargement des jobs en cours."
                        no-data-text="Il n'y a pas de job."
                        items-per-page="25"
                    >
                        <template v-slot:item.expression="{ value }">
                            {{ humanReadableExpression(value) }}
                        </template>

                        <template v-slot:item.isEnabled="{ value }">
                            <v-chip v-if="value" label append-icon="mdi-check" color="success">Activé</v-chip>
                            <v-chip v-else label append-icon="mdi-close" color="error">Non activé</v-chip>
                        </template>

                        <template v-slot:item.isRegistered="{ value }">
                            <v-chip v-if="value" label append-icon="mdi-check" color="success">Inscrit sur le serveur</v-chip>
                            <v-chip v-else label append-icon="mdi-close" color="error">Non inscrit sur le serveur</v-chip>
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <portal-jobs-edit
                                :entity="item"
                                @updated="updateToJobs"
                            ></portal-jobs-edit>
                            
                            <portal-jobs-history
                                :entity="item"
                            ></portal-jobs-history>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { JobSetting } from "~/models/JobSetting";
import cronstrue from "cronstrue/i18n";

const api = useApi();

useConfigPage('Jobs');

definePageMeta({
    layout: 'portal',
    middleware: 'auth',
});

const isLoading = computed(() => {
    return api.isLoading('jobs:list');
});

const headers = computed(() => {
    let headers = [
        { title: 'Clé', key: 'name' },
        { title: 'Période', key: 'expression' },
        { title: 'Est actif ?', key: 'isEnabled' },
        { title: "Est inscrit ?", key: 'isRegistered', minWidth: 150 },
        { title: 'Actions', key: 'actions', align: 'end' }
    ];

    return headers;
});

const jobs = ref<Array<JobSetting>>([]);

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    jobs.value = await api.get<Array<JobSetting>>('jobs', {
        loadingKey: 'jobs:list',
    });
};

// Humans expression
const humanReadableExpression = (expression: string) => {
    try {
        return cronstrue.toString(expression, { locale: 'fr' });
    } catch {
        return expression;
    }
};

// Update
const updateToJobs = (data: JobSetting) => {
    jobs.value = jobs.value.map((job) => {
        if (job.uuid === data.uuid) {
            data.isRegistered = job.isRegistered;
            return data;
        }

        return job;
    });
}
</script>