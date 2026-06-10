<template>
    <v-row>
        <v-col md="12" class="d-flex justify-end mb-n2">
            <v-btn color="secondary" variant="flat" @click="handleSearch" prepend-icon="mdi-refresh">Rafraîchir</v-btn>
        </v-col>

        <v-col md="12">
            <v-card flat :loading="isLoading">
                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-data-table
                                :headers="headers"
                                :items="contacts"
                                :loading="isLoading"
                                loading-text="Chargement des prises de contact en cours."
                                no-data-text="Il n'y a pas de prise de contact."
                                items-per-page="25"
                            >
                                <template v-slot:item.people="{ item }">
                                    <v-list lines="three" class="ml-n4">
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-avatar size="36" rounded="lg" class="flex-shrink-0 gradient-primary">
                                                    {{ item.lastname?.[0] }}{{ item.firstname?.[0] }}
                                                </v-avatar>
                                            </template>

                                            <v-list-item-title>{{ item.lastname.toUpperCase() }} {{ item.firstname }}</v-list-item-title>
                                            <v-list-item-subtitle>{{ item.email }}</v-list-item-subtitle>
                                            <v-list-item-subtitle v-if="item.company">{{ item.company }}</v-list-item-subtitle>
                                        </v-list-item>
                                    </v-list>
                                </template>

                                <template v-slot:item.message="{ value }">
                                    {{ value?.length > 200 ? value.slice(0, 200) + '…' : value }}
                                </template>

                                <template v-slot:item.createdAt="{ value }">
                                    <v-chip label color="success">{{ $date.french(value) }}</v-chip>
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <portal-contacts-reply
                                        :entity="item"
                                    ></portal-contacts-reply>

                                    <portal-contacts-view
                                        :entity="item"
                                    ></portal-contacts-view>

                                    <portal-contacts-archive
                                        :entity="item"
                                        @archived="archiveToContacts"
                                    ></portal-contacts-archive>
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
import type { Contact } from "~/models/Contact";

const api = useApi();

useConfigPage("Formulaire de contact");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLoading = computed(() => {
    return api.isLoading("contacts:list");
});

const headers = computed(() => {
    return [
        { title: 'Personne', key: 'people' },
        { title: 'Sujet', key: 'subject' },
        { title: "Prévisualisation", key: 'message', maxWidth: 350 },
        { title: 'Date', key: 'createdAt', },
        { title: 'Actions', key: 'actions', align: 'end', minWidth: 150 }
    ];
});

// Init of the page
let contacts = ref<Array<Contact>>([]);
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    contacts.value = await api.get<Array<Contact>>('contacts', {
        loadingKey: 'contacts:list',
        params: {

        }
    });
};

const archiveToContacts = (data: Contact) => {
    contacts.value = contacts.value.filter((entity) => entity.uuid !== data.uuid);
};
</script>