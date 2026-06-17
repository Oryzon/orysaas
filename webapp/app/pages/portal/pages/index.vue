<template>
    <v-row>
        <v-col md="12" class="d-flex justify-end mb-n2">
            <portal-pages-add
                @created="addToPages"
            ></portal-pages-add>
        </v-col>

        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-data-table
                                :headers="headers"
                                :items="pages"
                                :loading="isLoading"
                                loading-text="Chargement des pages en cours."
                                no-data-text="Il n'y a pas de page."
                                items-per-page="25"
                            >
                                <template v-slot:item.isPublished="{ value }">
                                    <v-chip v-if="value" label append-icon="mdi-check" color="success">Page publiée</v-chip>
                                    <v-chip v-else label append-icon="mdi-close" color="error">Page non publiée</v-chip>
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <v-btn
                                        variant="text"
                                        icon
                                        color="info"
                                        :to="`/portal/pages/${item.uuid}`"
                                    >
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>

                                    <portal-pages-remove
                                        :entity="item"
                                        @removed="removeToPages"
                                    ></portal-pages-remove>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Page } from "~/models/Page";

const api = useApi();

useConfigPage("Pages");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLoading = computed(() => {
    return api.isLoading("pages:list");
});

const headers = computed(() => {
    return [
        { title: 'Titre', key: 'title' },
        { title: 'Description', key: 'metaDescription' },
        { title: "Page publiée ?", key: 'isPublished', minWidth: 150 },
        { title: 'Actions', key: 'actions', align: 'end', minWidth: 150 }
    ];
});

let pages = ref<Array<Page>>([]);

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    pages.value = await api.get<Array<Page>>('pages', {
        loadingKey: 'pages:list',
        params: {

        }
    });
};

const addToPages = (data: Page) => {
    pages.value.push(data);
}

const removeToPages = (data: Page) => {
    pages.value = pages.value.filter((entity) => entity.uuid !== data.uuid);
}
</script>