<template>
    <v-row>
        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <div class="d-flex align-center ga-4">
                        <v-avatar size="64" rounded="lg" class="gradient-primary flex-shrink-0 text-h5 font-weight-bold">
                            <v-img v-if="organization.logoUrl" :src="organization.logoUrl" />
                            <span v-else>{{ getInitials(organization.name) }}</span>
                        </v-avatar>

                        <div class="flex-grow-1">
                            <div class="text-h4 font-weight-bold">{{ organization.name }}</div>

                            <div class="d-flex align-center ga-2 mt-1 flex-wrap">
                                <v-chip
                                    color="primary"
                                    variant="tonal"
                                    label
                                    prepend-icon="mdi-pound"
                                >
                                    {{ organization.slug }}
                                </v-chip>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col md="7">
            <v-row>
                <v-col md="12">
                    <v-card flat>
                        <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                            <v-icon start color="primary">mdi-information-variant-box</v-icon>
                            Informations générales
                        </v-card-title>

                        <v-divider />

                        <v-card-text>
                            <v-row>
                                <v-col md="4">
                                    <v-text-field
                                        prepend-inner-icon="mdi-identifier"
                                        variant="outlined"
                                        readonly
                                        label="SIRET"
                                        v-model="organization.siret"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="4">
                                    <v-text-field
                                        prepend-inner-icon="mdi-receipt-text-outline"
                                        variant="outlined"
                                        readonly
                                        label="Numéro de TVA Intracommunautaire"
                                        v-model="organization.vatCode"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="4">
                                    <v-text-field
                                        prepend-inner-icon="mdi-tag-outline"
                                        variant="outlined"
                                        readonly
                                        label="Code NAF / APE"
                                        v-model="organization.nafCode"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="4" class="mt-n6">
                                    <v-text-field
                                        prepend-inner-icon="mdi-office-building"
                                        variant="outlined"
                                        readonly
                                        label="Forme juridique"
                                        v-model="organization.legalForm"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="4" class="mt-n6">
                                    <v-text-field
                                        prepend-inner-icon="mdi-currency-eur"
                                        variant="outlined"
                                        readonly
                                        label="Capital social"
                                        v-model="organization.shareCapital"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="4" class="mt-n6">
                                    <v-text-field
                                        prepend-inner-icon="mdi-map-marker-outline"
                                        variant="outlined"
                                        readonly
                                        label="Ville d'immatriculation"
                                        v-model="organization.cityRegistry"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="12" class="mt-n6">
                                    <v-text-field
                                        prepend-inner-icon="mdi-map-marker"
                                        variant="outlined"
                                        readonly
                                        label="Adresse"
                                        v-model="completeAdress"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col md="12">
                    <v-card flat>
                        <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                            <v-icon
                                start
                                color="primary"
                            >
                                mdi-account-group
                            </v-icon>

                            Membres

                            <v-chip
                                class="ml-2"
                                color="primary"
                                variant="tonal"
                            >
                                {{ organization.members?.length ?? 0 }}
                            </v-chip>

                            <v-btn
                                class="float-right"
                                prepend-icon="mdi-email-fast-outline"
                                variant="tonal"
                                color="primary"
                            >
                                Voir invitations
                            </v-btn>
                        </v-card-title>

                        <v-divider />

                        <v-card-text>
                            <v-row>
                                <v-col md="12">
                                    <v-list v-if="organization.members?.length" density="compact">
                                        <template v-for="(member, index) in organization.members" :key="member.uuid">
                                            <v-list-item :prepend-avatar="undefined">
                                                <template #prepend>
                                                    <v-avatar size="36" rounded="lg" class="gradient-primary mr-3 text-caption font-weight-bold">
                                                        {{ getInitials(member.member.firstname + ' ' + member.member.lastname) }}
                                                    </v-avatar>
                                                </template>

                                                <v-list-item-title class="text-body-2 font-weight-medium">
                                                    {{ member.member.lastname }} {{ member.member.firstname }}
                                                </v-list-item-title>

                                                <v-list-item-subtitle class="text-caption text-medium-emphasis">
                                                    {{ member.member?.email }}
                                                </v-list-item-subtitle>

                                                <template #append>
                                                    <v-chip :color="OrganizationMemberRoleColor[member.role]" variant="tonal">
                                                        {{ OrganizationMemberRoleLabel[member.role] }}
                                                    </v-chip>
                                                </template>
                                            </v-list-item>

                                            <v-divider v-if="index < organization.members.length - 1" inset />
                                        </template>
                                    </v-list>

                                    <v-card-text v-else class="text-medium-emphasis text-caption"> Aucun membre. </v-card-text>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
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
const organization = ref<Partial<Organization>>({});

onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    organization.value = await api.get<Organization>(`organization/${slug}`, {
        loadingKey: "organizations:list",
    });
};

const completeAdress = computed(() => {
    return (organization.value.address ?? 'N.R') + ', ' + (organization.value.postalCode ?? 'N.R') + ' - ' + (organization.value.city ?? 'N.R') + ' - ' + (organization.value.country ?? 'N.R')
});
</script>
