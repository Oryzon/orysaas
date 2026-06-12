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
                            <div class="d-flex align-center ga-3 py-2">
                                <v-avatar size="36" rounded="lg" class="gradient-primary flex-shrink-0">
                                    {{ getInitials(item) }}
                                </v-avatar>

                                <div>
                                    <div class="text-body-2 font-weight-medium">{{ item.firstname || "—" }}</div>
                                    <div class="text-caption text-medium-emphasis">{{ item.lastname?.toUpperCase() || "—" }}</div>
                                </div>
                            </div>
                        </template>

                        <template v-slot:item.email="{ item }">
                            <div class="py-2">
                                <v-chip label color="primary" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-email-outline">
                                    {{ item.email }}
                                </v-chip>
                            </div>
                        </template>

                        <template v-slot:item.origin="{ value }">
                            <div class="py-2">
                                <v-chip label :color="getOriginChipColor(value)" variant="tonal" size="small" rounded="lg">
                                    {{ getOriginLabel(value) }}
                                </v-chip>
                            </div>
                        </template>

                        <template v-slot:item.isSaasAdmin="{ value }">
                            <div class="py-2">
                                <v-chip
                                    label
                                    :color="value ? 'success' : 'grey-darken-1'"
                                    variant="tonal"
                                    size="small"
                                    rounded="lg"
                                    :prepend-icon="value ? 'mdi-shield-check' : 'mdi-shield-off-outline'"
                                >
                                    {{ value ? "Oui" : "Non" }}
                                </v-chip>
                            </div>
                        </template>

                        <template v-slot:item.lastLogin="{ value }">
                            <div class="py-2">
                                <v-chip
                                    label
                                    color="info"
                                    variant="tonal"
                                    size="small"
                                    rounded="lg"
                                    prepend-icon="mdi-calendar-clock-outline"
                                >
                                    {{ value ? $date.french(value) : "Jamais" }}
                                </v-chip>
                            </div>
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <div class="d-flex justify-end py-2">
                                <v-btn :to="`/portal/users/${item.uuid}`" icon="mdi-cog-outline" variant="flat" size="small"></v-btn>
                            </div>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import { type User } from "~/models/User";

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
    let headers = [
        { title: "Prénom", key: "firstname" },
        { title: "Email", key: "email" },
        { title: "Origine", key: "origin" },
        { title: "Saas Admin", key: "isSaasAdmin" },
        { title: "Dernière connexion", key: "lastLogin" },
        { title: "Actions", key: "actions", align: "end" },
    ];

    return headers;
});

const getInitials = (user: User) => {
    const firstname = user.firstname?.[0] ?? "";
    const lastname = user.lastname?.[0] ?? "";

    return (firstname + lastname).toUpperCase() || user.email[0]?.toUpperCase();
};

const getOriginChipColor = (origin: unknown) => {
    const value = String(origin ?? "").toLowerCase();

    if (value.includes("google")) {
        return "red-darken-2";
    }

    if (value.includes("microsoft")) {
        return "blue-darken-2";
    }

    if (value.includes("local") || value.includes("email")) {
        return "teal-darken-2";
    }

    return "secondary";
};

const getOriginLabel = (origin: unknown) => {
    return String(origin ?? "—");
};

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
