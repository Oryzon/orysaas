<template>
    <v-row>
        <v-col md="12" class="d-flex justify-end mb-n2">
            <portal-menus-add
                @created="addToMenus"
            ></portal-menus-add>
        </v-col>

        <v-col md="12">
            <v-card flat :loading="isLoading">
                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-data-table
                                :headers="headers"
                                :items="menus"
                                :loading="isLoading"
                                loading-text="Chargement des menus en cours."
                                no-data-text="Il n'y a pas de menu."
                                items-per-page="25"
                            >
                                <template v-slot:item.isActive="{ value }">
                                    <v-chip v-if="value" label append-icon="mdi-check" color="success">Menu activé</v-chip>
                                    <v-chip v-else label append-icon="mdi-close" color="error">Menu désactivé</v-chip>
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <v-btn
                                        variant="text"
                                        icon
                                        color="primary"
                                        :to="`/portal/menus/${item.uuid}`"
                                    >
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>

                                    <portal-menus-remove
                                        :entity="item"
                                        @removed="removeToMenus"
                                    ></portal-menus-remove>
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
import type { Menu } from "~/models/Menu";

const api = useApi();

useConfigPage("Menus");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLoading = computed(() => {
    return api.isLoading("menus:list");
});

const headers = computed(() => {
    return [
        { title: 'Titre', key: 'label' },
        { title: 'Location / Clé', key: 'key' },
        { title: "Menu actif ?", key: 'isActive', minWidth: 150 },
        { title: 'Actions', key: 'actions', align: 'end', minWidth: 150 }
    ];
});

let menus = ref<Array<Menu>>([]);

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    menus.value = await api.get<Array<Menu>>('menus', {
        loadingKey: 'menus:list',
        params: {

        }
    });
};

const addToMenus = (data: Menu) => {
    menus.value.push(data);
}

const removeToMenus = (data: Menu) => {
    menus.value = menus.value.filter((entity) => entity.uuid !== data.uuid);
}
</script>