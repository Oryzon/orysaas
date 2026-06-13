<template>
    <v-row v-if="isLoading">
        <v-col cols="12" class="d-flex justify-center py-12">
            <v-progress-circular indeterminate color="primary" size="48" />
        </v-col>
    </v-row>

    <template v-else-if="organization">
        <!-- Header -->
        <v-row class="mb-2">
            <v-col cols="12">
                <v-card flat rounded="lg">
                    <v-card-text>
                        <div class="d-flex align-center ga-4">
                            <v-avatar size="64" rounded="lg" class="gradient-primary flex-shrink-0 text-h5 font-weight-bold">
                                <v-img v-if="organization.logoUrl" :src="organization.logoUrl" />
                                <span v-else>{{ organizationInitials(organization.name) }}</span>
                            </v-avatar>
                            <div class="flex-grow-1">
                                <div class="text-h6 font-weight-bold">{{ organization.name }}</div>
                                <div class="d-flex align-center ga-2 mt-1 flex-wrap">
                                    <v-chip color="primary" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-pound">
                                        {{ organization.slug }}
                                    </v-chip>
                                    <v-chip
                                        v-if="organization.role"
                                        color="secondary"
                                        variant="tonal"
                                        size="small"
                                        rounded="lg"
                                        prepend-icon="mdi-shield-account"
                                    >
                                        {{ organization.role }}
                                    </v-chip>
                                    <v-chip color="info" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-account-group">
                                        {{ organization.members?.length ?? organization.nbMembers ?? 0 }}
                                        {{ (organization.members?.length ?? organization.nbMembers ?? 0) > 1 ? "membres" : "membre" }}
                                    </v-chip>
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <!-- Informations légales -->
            <v-col cols="12" md="6">
                <v-card flat rounded="lg" height="100%">
                    <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                        <v-icon start color="primary">mdi-gavel</v-icon>
                        Informations légales
                    </v-card-title>
                    <v-divider />
                    <v-list density="compact" lines="two">
                        <v-list-item prepend-icon="mdi-office-building" title="Forme juridique" :subtitle="organization.legalForm || '—'" />
                        <v-divider inset />
                        <v-list-item prepend-icon="mdi-identifier" title="SIRET" :subtitle="organization.siret || '—'" />
                        <v-divider inset />
                        <v-list-item prepend-icon="mdi-currency-eur" title="Capital social" :subtitle="organization.shareCapital || '—'" />
                        <v-divider inset />
                        <v-list-item prepend-icon="mdi-tag-outline" title="Code NAF" :subtitle="organization.nafCode || '—'" />
                        <v-divider inset />
                        <v-list-item prepend-icon="mdi-receipt-text-outline" title="Numéro TVA" :subtitle="organization.vatCode || '—'" />
                        <v-divider inset />
                        <v-list-item
                            prepend-icon="mdi-map-marker-outline"
                            title="Ville d'immatriculation"
                            :subtitle="organization.cityRegistry || '—'"
                        />
                    </v-list>
                </v-card>
            </v-col>

            <!-- Adresse -->
            <v-col cols="12" md="6">
                <v-card flat rounded="lg" height="100%">
                    <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                        <v-icon start color="primary">mdi-map-marker</v-icon>
                        Adresse
                    </v-card-title>
                    <v-divider />
                    <v-list density="compact" lines="two">
                        <v-list-item prepend-icon="mdi-road-variant" title="Adresse" :subtitle="organization.address || '—'" />
                        <v-divider inset />
                        <v-list-item prepend-icon="mdi-city" title="Ville" :subtitle="organization.city || '—'" />
                        <v-divider inset />
                        <v-list-item prepend-icon="mdi-mailbox-outline" title="Code postal" :subtitle="organization.postalCode || '—'" />
                        <v-divider inset />
                        <v-list-item prepend-icon="mdi-earth" title="Pays" :subtitle="organization.country || '—'" />
                    </v-list>
                </v-card>
            </v-col>

            <!-- Membres -->
            <v-col cols="12" md="6">
                <v-card flat rounded="lg">
                    <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                        <v-icon start color="primary">mdi-account-group</v-icon>
                        Membres
                        <v-chip class="ml-2" size="x-small" color="primary" variant="tonal">{{ organization.members?.length ?? 0 }}</v-chip>
                    </v-card-title>
                    <v-divider />
                    <v-list v-if="organization.members?.length" density="compact">
                        <template v-for="(member, index) in organization.members" :key="member.uuid">
                            <v-list-item :prepend-avatar="undefined">
                                <template #prepend>
                                    <v-avatar size="36" rounded="lg" class="gradient-primary mr-3 text-caption font-weight-bold">
                                        {{ memberInitials(member.member) }}
                                    </v-avatar>
                                </template>
                                <v-list-item-title class="text-body-2 font-weight-medium">
                                    {{ memberFullName(member.member) }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-caption text-medium-emphasis">
                                    {{ member.member?.email }}
                                </v-list-item-subtitle>
                                <template #append>
                                    <v-chip :color="OrganizationMemberRoleColor[member.role]" variant="tonal" size="x-small" rounded="lg">
                                        {{ OrganizationMemberRoleLabel[member.role] }}
                                    </v-chip>
                                </template>
                            </v-list-item>
                            <v-divider v-if="index < organization.members.length - 1" inset />
                        </template>
                    </v-list>
                    <v-card-text v-else class="text-medium-emphasis text-caption"> Aucun membre. </v-card-text>
                </v-card>
            </v-col>

            <!-- Invitations -->
            <v-col cols="12" md="6">
                <v-card flat rounded="lg">
                    <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                        <v-icon start color="primary">mdi-email-fast-outline</v-icon>
                        Invitations
                        <v-chip class="ml-2" size="x-small" color="primary" variant="tonal">{{ organization.invites?.length ?? 0 }}</v-chip>
                    </v-card-title>
                    <v-divider />
                    <v-list v-if="organization.invites?.length" density="compact">
                        <template v-for="(invite, index) in organization.invites" :key="invite.uuid">
                            <v-list-item prepend-icon="mdi-email-outline">
                                <v-list-item-title class="text-body-2 font-weight-medium">{{ invite.email }}</v-list-item-title>
                                <v-list-item-subtitle class="text-caption text-medium-emphasis">
                                    Expire le {{ formatDate(invite.expiresAt) }}
                                </v-list-item-subtitle>
                                <template #append>
                                    <div class="d-flex align-center ga-2">
                                        <v-chip
                                            :color="OrganizationMemberRoleColor[invite.role]"
                                            variant="tonal"
                                            size="x-small"
                                            rounded="lg"
                                        >
                                            {{ OrganizationMemberRoleLabel[invite.role] }}
                                        </v-chip>
                                        <v-chip
                                            :color="invite.acceptedAt ? 'success' : 'warning'"
                                            variant="tonal"
                                            size="x-small"
                                            rounded="lg"
                                        >
                                            {{ invite.acceptedAt ? "Acceptée" : "En attente" }}
                                        </v-chip>
                                    </div>
                                </template>
                            </v-list-item>
                            <v-divider v-if="index < organization.invites.length - 1" inset />
                        </template>
                    </v-list>
                    <v-card-text v-else class="text-medium-emphasis text-caption"> Aucune invitation en cours. </v-card-text>
                </v-card>
            </v-col>

            <!-- Métadonnées -->
            <v-col cols="12">
                <v-card flat rounded="lg">
                    <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                        <v-icon start color="primary">mdi-clock-outline</v-icon>
                        Métadonnées
                    </v-card-title>
                    <v-divider />
                    <v-row class="pa-4" dense>
                        <v-col cols="12" sm="6" md="3">
                            <div class="text-caption text-medium-emphasis">Créé le</div>
                            <div class="text-body-2">{{ formatDate(organization.createdAt) }}</div>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <div class="text-caption text-medium-emphasis">Créé par</div>
                            <div class="text-body-2">{{ organization.createdBy || "—" }}</div>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <div class="text-caption text-medium-emphasis">Modifié le</div>
                            <div class="text-body-2">{{ organization.updatedAt ? formatDate(organization.updatedAt) : "—" }}</div>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <div class="text-caption text-medium-emphasis">Modifié par</div>
                            <div class="text-body-2">{{ organization.updatedBy || "—" }}</div>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </template>

    <v-row v-else>
        <v-col cols="12" class="d-flex justify-center py-12">
            <div class="text-medium-emphasis">Organisation introuvable.</div>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import { type Organization } from "~/models/Organization";
import { OrganizationMemberRoleLabel, OrganizationMemberRoleColor } from "~/models/OrganizationMember";
import type { User } from "~/models/User";

const api = useApi();

useConfigPage("Organisation");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLoading = computed(() => api.isLoading("organizations:list"));

const slug = useRoute().params.slug as string;
const organization = ref<Organization | null>(null);

onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    organization.value = await api.get<Organization>(`organization/${slug}`, {
        loadingKey: "organizations:list",
    });
};

const organizationInitials = (name: string) => {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
};

const memberInitials = (user: User | undefined) => {
    if (!user) return "?";
    const first = user.firstname?.[0]?.toUpperCase() ?? "";
    const last = user.lastname?.[0]?.toUpperCase() ?? "";
    return first + last || user.email[0]?.toUpperCase();
};

const memberFullName = (user: User | undefined) => {
    if (!user) return "Inconnu";
    const full = [user.firstname, user.lastname].filter(Boolean).join(" ");
    return full || user.email;
};

const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
};
</script>
