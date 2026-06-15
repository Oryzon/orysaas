<template>
    <v-row>
        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <div class="d-flex align-center ga-4">
                        <v-avatar size="64" rounded="lg" class="gradient-primary flex-shrink-0 text-h5 font-weight-bold">
                            <span>{{ getInitials(user.firstname + ' ' + user.lastname) }}</span>
                        </v-avatar>

                        <div class="flex-grow-1">
                            <div class="text-h4 font-weight-bold">{{ user.lastname }} {{ user.firstname }}</div>

                            <div class="d-flex align-center ga-2 mt-1 flex-wrap">
                                <v-chip
                                    color="primary"
                                    variant="tonal"
                                    label
                                    prepend-icon="mdi-email"
                                >
                                    {{ user.email }}
                                </v-chip>

                                <v-chip
                                    :color="getUserOriginColor(user.origin)"
                                    variant="tonal"
                                    label
                                    prepend-icon="mdi-target-variant"
                                >
                                    {{ getUserOriginLabel(user.origin) }}
                                </v-chip>

                                <v-chip
                                    :color="user.isActive ? 'success' : 'error'"
                                    variant="tonal"
                                    label
                                    :prepend-icon="user.isActive ? 'mdi-check' : 'mdi-close'"
                                >
                                    L'utilisateur est {{ user.isActive ? 'actif' : 'non-actif' }}.
                                </v-chip>

                                <v-chip
                                    :color="user.isSaasAdmin ? 'success' : 'error'"
                                    variant="tonal"
                                    label
                                    :prepend-icon="user.isSaasAdmin ? 'mdi-shield-check-outline' : 'mdi-shield-alert'"
                                >
                                    L'utilisateur {{ user.isSaasAdmin ? "est administrateur" : "n'est pas administateur" }}.
                                </v-chip>

                                <v-chip
                                    color="info"
                                    variant="tonal"
                                    label
                                    prepend-icon="mdi-calendar-clock-outline"
                                >
                                    Dernière connexion {{ $date.french(user.lastLogin) }}
                                </v-chip>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col md="12">
            <v-card flat>
                <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                    <v-icon start color="primary">mdi-domain</v-icon>
                    Organisations
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-data-table
                                :headers="headers"
                                :items="user.organizations"
                                :loading="isLoading"
                                loading-text="Chargement des organisations en cours."
                                no-data-text="Il n'y a pas d'organisation."
                                items-per-page="25"
                            >
                                <template v-slot:item.logoUrl="{ item, value }">
                                    <v-avatar size="48" rounded="lg" class="gradient-primary flex-shrink-0 text-h5 font-weight-bold">
                                        <v-img v-if="value" :src="value" />
                                        <span v-else>{{ getInitials(item.name) }}</span>
                                    </v-avatar>
                                </template>

                                <template v-slot:item.slug="{ value }">
                                    <v-chip color="primary" :to="`/portal/organizations/${value}`">
                                        # {{ value }}
                                    </v-chip>
                                </template>

                                <template v-slot:item.role="{ value }">
                                    <v-chip
                                        :color="OrganizationMemberRoleColor[value as OrganizationMemberRole] ?? 'grey'"
                                        variant="tonal"
                                        rounded="lg"
                                    >
                                        {{ OrganizationMemberRoleLabel[value as OrganizationMemberRole] ?? value }}
                                    </v-chip>
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
import { getUserOriginColor, getUserOriginLabel, type User } from "~/models/User";
import {
    OrganizationMemberRole,
    OrganizationMemberRoleColor,
    OrganizationMemberRoleLabel
} from "#shared/organization-roles";

const api = useApi();

useConfigPage("Utilisateurs");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLoading = computed(() => {
    return api.isLoading("user:detail");
});

const uuid = useRoute().params.uuid as string;

const user = ref<Partial<User>>({});

const headers = [
    { title: "", key: "logoUrl", maxWidth: "38" },
    { title: "Nom", key: "name" },
    { title: "Slug", key: "slug" },
    { title: "Nombre de membres", key: "nbMembers" },
    { title: "Role", key: "role" },
];

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    user.value = await api.get<User>(`user/${uuid}`, {
        loadingKey: "user:detail",
    });
};
</script>
