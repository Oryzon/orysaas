<template>
    <v-row>
        <v-col md="12" class="d-flex justify-end mb-n2">
            <v-btn variant="flat" color="secondary" prepend-icon="mdi-arrow-left" to="/portal/users">Retour</v-btn>
        </v-col>

        <v-col md="12">
            <v-card flat elevation="1" :loading="isLoading" class="rounded-lg">
                <v-card-text>
                    <template v-if="user">
                        <div class="d-flex align-center ga-4 mb-6">
                            <v-avatar size="56" rounded="lg" class="gradient-primary flex-shrink-0">
                                {{ getInitials(user) }}
                            </v-avatar>

                            <div class="d-flex flex-column">
                                <span class="text-h6 font-weight-bold">{{ getFullName(user) }}</span>
                                <span class="text-body-2 text-medium-emphasis">{{ user.email }}</span>
                            </div>
                        </div>

                        <v-divider class="mb-4"></v-divider>

                        <v-row>
                            <v-col cols="12" md="6" class="py-2">
                                <div class="text-caption text-medium-emphasis mb-1">Email</div>
                                <v-chip label color="primary" variant="tonal" rounded="lg" prepend-icon="mdi-email-outline">
                                    {{ user.email }}
                                </v-chip>
                            </v-col>

                            <v-col cols="12" md="6" class="py-2">
                                <div class="text-caption text-medium-emphasis mb-1">Statut SaaS Admin</div>
                                <v-chip
                                    label
                                    :color="user.isSaasAdmin ? 'success' : 'grey-darken-1'"
                                    variant="tonal"
                                    rounded="lg"
                                    :prepend-icon="user.isSaasAdmin ? 'mdi-shield-check' : 'mdi-shield-off-outline'"
                                >
                                    {{ user.isSaasAdmin ? "Oui" : "Non" }}
                                </v-chip>
                            </v-col>

                            <v-col cols="12" md="6" class="py-2">
                                <div class="text-caption text-medium-emphasis mb-1">Compte actif</div>
                                <v-chip
                                    label
                                    :color="user.isActive ? 'success' : 'error'"
                                    variant="tonal"
                                    rounded="lg"
                                    :prepend-icon="user.isActive ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                                >
                                    {{ user.isActive ? "Actif" : "Inactif" }}
                                </v-chip>
                            </v-col>

                            <v-col cols="12" md="6" class="py-2">
                                <div class="text-caption text-medium-emphasis mb-1">Dernière connexion</div>
                                <v-chip label color="info" variant="tonal" rounded="lg" prepend-icon="mdi-calendar-clock-outline">
                                    {{ user.lastLogin ? $date.french(user.lastLogin) : "Jamais" }}
                                </v-chip>
                            </v-col>

                            <v-col cols="12" md="6" class="py-2">
                                <div class="text-caption text-medium-emphasis mb-1">Créé le</div>
                                <div class="text-body-2">{{ $date.french(user.createdAt) }}</div>
                            </v-col>

                            <v-col cols="12" md="6" class="py-2">
                                <div class="text-caption text-medium-emphasis mb-1">Mis à jour le</div>
                                <div class="text-body-2">{{ user.updatedAt ? $date.french(user.updatedAt) : "—" }}</div>
                            </v-col>
                        </v-row>

                        <v-divider class="my-4"></v-divider>

                        <div class="text-subtitle-2 font-weight-bold mb-4">Organisations</div>

                        <v-row v-if="organizations.length" class="px-3 text-caption text-medium-emphasis font-weight-bold">
                            <v-col cols="5" class="text-no-wrap">Entreprise</v-col>
                            <v-col cols="2" class="text-no-wrap">Rôle</v-col>
                            <v-col cols="2" class="text-no-wrap">Membres</v-col>
                            <v-col cols="3" class="text-no-wrap text-right">Action</v-col>
                        </v-row>

                        <v-row v-if="organizations.length" class="mt-0 pt-0">
                            <v-col v-for="organization in organizations" :key="organization.uuid" cols="12" class="pt-2 pb-1">
                                <v-card variant="tonal" color="secondary" rounded="lg">
                                    <v-card-text class="pa-3">
                                        <v-row class="align-center">
                                            <v-col cols="5">
                                                <div class="text-body-2 font-weight-medium text-truncate">
                                                    {{ organization.name || "—" }}
                                                </div>
                                            </v-col>

                                            <v-col cols="2">
                                                <v-chip size="small" variant="tonal" color="info" rounded="lg" class="text-no-wrap">
                                                    {{ organization.role || "—" }}
                                                </v-chip>
                                            </v-col>

                                            <v-col cols="2">
                                                <v-chip size="small" variant="tonal" color="primary" rounded="lg" class="text-no-wrap">
                                                    {{ organization.nbMembers ?? "—" }} membre{{
                                                        (organization.nbMembers ?? 0) > 1 ? "s" : ""
                                                    }}
                                                </v-chip>
                                            </v-col>

                                            <v-col cols="3" class="d-flex justify-end">
                                                <v-btn
                                                    size="small"
                                                    color="secondary"
                                                    variant="flat"
                                                    prepend-icon="mdi-arrow-right"
                                                    :to="organization.slug ? `/portal/organizations/${organization.slug}` : undefined"
                                                    :disabled="!organization.slug"
                                                >
                                                    Aller vers l'organisation
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-alert
                            v-else
                            type="info"
                            variant="tonal"
                            density="comfortable"
                            icon="mdi-domain-off"
                            title="Aucune organization"
                            text="Cet utilisateur n'est rattaché à aucune organization."
                        ></v-alert>
                    </template>

                    <v-alert
                        v-else-if="!isLoading"
                        type="warning"
                        variant="tonal"
                        density="comfortable"
                        icon="mdi-alert-outline"
                        title="Utilisateur introuvable"
                        text="Cet utilisateur n'existe pas ou n'est plus disponible."
                    ></v-alert>
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
    return api.isLoading("user:detail");
});

const uuid = useRoute().params.uuid as string;

type UserOrganization = {
    uuid: string;
    slug: string | null;
    name: string | null;
    logoUrl: string | null;
    role: string | null;
    nbMembers: number | null;
};

type UserDetail = User & {
    organizations?: Array<UserOrganization>;
};

const user = ref<UserDetail | null>(null);

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    user.value = await api.get<UserDetail>(`user/${uuid}`, {
        loadingKey: "user:detail",
    });
};

const organizations = computed(() => {
    return user.value?.organizations ?? [];
});

const getInitials = (entity: User) => {
    const firstname = entity.firstname?.[0] ?? "";
    const lastname = entity.lastname?.[0] ?? "";

    return (firstname + lastname).toUpperCase() || entity.email[0]?.toUpperCase();
};

const getFullName = (entity: User) => {
    const firstname = entity.firstname ?? "";
    const lastname = entity.lastname ?? "";
    const fullName = `${firstname} ${lastname}`.trim();

    return fullName || "Utilisateur";
};
</script>
