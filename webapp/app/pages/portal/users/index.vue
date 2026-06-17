<template>
    <v-row>
        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <v-data-table
                        :headers="headers"
                        :items="users"
                        :loading="isLoading"
                        loading-text="Chargement des utilisateurs en cours."
                        no-data-text="Il n'y a pas d'utilisateur."
                        items-per-page="25"
                    >
                        <template v-slot:item.firstname="{ item }">
                            <v-list lines="two" class="ml-n4">
                                <v-list-item>
                                    <template v-slot:prepend>
                                        <v-avatar size="48" rounded="lg" class="gradient-primary flex-shrink-0">
                                            {{ getInitials(item.firstname + ' ' + item.lastname) }}
                                        </v-avatar>
                                    </template>

                                    <v-list-item-title>{{ item.lastname?.toUpperCase() }} {{ item.firstname }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ item.email }}
                                    </v-list-item-subtitle>
                                </v-list-item>
                            </v-list>
                        </template>

                        <template v-slot:item.origin="{ value }">
                            <v-chip
                                label
                                :color="getUserOriginColor(value)"
                                variant="tonal"
                            >
                                {{ getUserOriginLabel(value) }}
                            </v-chip>
                        </template>

                        <template v-slot:item.isSaasAdmin="{ value }">
                            <v-chip
                                label
                                :color="value ? 'success' : 'error'"
                                variant="tonal"
                                :prepend-icon="value ? 'mdi-check' : 'mdi-close'"
                            >
                                {{ value ? "Oui" : "Non" }}
                            </v-chip>
                        </template>

                        <template v-slot:item.lastLogin="{ value }">
                            <v-chip
                                label
                                color="info"
                                variant="tonal"
                                prepend-icon="mdi-calendar-clock-outline"
                            >
                                {{ value ? $date.french(value) : "Jamais" }}
                            </v-chip>
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-btn
                                :to="`/portal/users/${item.uuid}`"
                                variant="text"
                                icon
                                color="info"
                            >
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import { type User, getUserOriginColor, getUserOriginLabel } from "~/models/User";

const api = useApi();

useConfigPage("Utilisateurs");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLoading = computed(() => {
    return api.isLoading("users:list");
});

const headers = computed(() => {
    return [
        { title: "Utilisateur", key: "firstname" },
        { title: "Origine", key: "origin" },
        { title: "Administrateur ?", key: "isSaasAdmin" },
        { title: "Dernière connexion", key: "lastLogin" },
        { title: "Actions", key: "actions", align: "end" },
    ];
});

const users = ref<Array<User>>([]);

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    users.value = await api.get<Array<User>>("users", {
        loadingKey: "users:list",
    });
};
</script>
