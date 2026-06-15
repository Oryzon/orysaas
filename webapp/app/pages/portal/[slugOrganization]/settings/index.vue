<template>
    <v-row>
        <v-col md="12">
            <v-tabs
                v-model="activeTab"
                color="primary"
                align-tabs="start"
                class="settings-tabs"
            >
                <v-tab value="general" prepend-icon="mdi-cog-outline">Général</v-tab>
                <v-tab value="notifications" prepend-icon="mdi-bell-outline">Notifications</v-tab>
                <v-tab value="api" prepend-icon="mdi-key-outline">API</v-tab>
                <v-tab value="danger" class="text-error" prepend-icon="mdi-alert-outline">Zone de danger</v-tab>
            </v-tabs>

            <v-divider class="mb-2" />

            <v-tabs-window v-model="activeTab">
                <v-tabs-window-item value="general">
                    <v-card rounded="lg" border flat>
                        <div class="d-flex align-center justify-space-between px-6 pt-6 pb-1">
                            <div>
                                <div class="text-h6 font-weight-bold">Informations de l'organisation</div>
                                <div class="text-body-2 text-medium-emphasis mt-1">Modifiez le nom et l'identifiant de votre organisation.</div>
                            </div>

                            <div class="logo-upload" @click="triggerLogoInput">
                                <v-avatar size="68" rounded="lg" :class="{ 'gradient-primary': !organization.logoUrl, 'bg-white': !!organization.logoUrl }">
                                    <v-img v-if="organization.logoUrl" :src="organization.logoUrl" cover />
                                    <span v-else>{{ orgInitials }}</span>
                                </v-avatar>

                                <div class="logo-overlay">
                                    <v-icon size="20" color="white">mdi-camera</v-icon>
                                </div>

                                <input
                                    ref="logoInput"
                                    type="file"
                                    accept="image/*"
                                    class="d-none"
                                    @change="handleLogoChange"
                                />
                            </div>
                        </div>

                        <v-divider />

                        <v-card-text class="pa-6">
                            <v-form
                                ref="form"
                                v-model="isFormValid"
                            >
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            hide-details="auto"
                                            label="Nom"
                                            variant="outlined"
                                            v-model="organization.name"
                                            :rules="[ rules.required(), rules.minLength(2) ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            hide-details="auto"
                                            label="Slug"
                                            variant="outlined"
                                            base-color="primary"
                                            v-model="organization.slug"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                            readonly
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="3" class="mt-n2">
                                        <v-text-field
                                            label="Forme juridique"
                                            variant="outlined"
                                            v-model="organization.legalForm"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="3" class="mt-n2">
                                        <v-text-field
                                            label="Capital"
                                            variant="outlined"
                                            v-model="organization.shareCapital"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="3" class="mt-n2">
                                        <v-text-field
                                            label="Ville du registre des commerces"
                                            variant="outlined"
                                            v-model="organization.cityRegistry"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="3" class="mt-n2">
                                        <v-text-field
                                            label="Code NAF / APE"
                                            variant="outlined"
                                            v-model="organization.nafCode"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="6" class="mt-n2">
                                        <v-text-field
                                            label="SIRET"
                                            variant="outlined"
                                            v-model="organization.siret"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="6" class="mt-n2">
                                        <v-text-field
                                            label="TVA intracommunautaire"
                                            variant="outlined"
                                            v-model="organization.vatCode"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="4" class="mt-n2">
                                        <v-text-field
                                            label="Adresse postale"
                                            variant="outlined"
                                            v-model="organization.address"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="2" class="mt-n2">
                                        <v-text-field
                                            label="Code postal"
                                            variant="outlined"
                                            v-model="organization.postalCode"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="3" class="mt-n2">
                                        <v-text-field
                                            label="Ville"
                                            variant="outlined"
                                            v-model="organization.city"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="3" class="mt-n2">
                                        <v-text-field
                                            label="Pays"
                                            variant="outlined"
                                            v-model="organization.country"
                                            hide-details="auto"
                                            :rules="[ rules.required() ]"
                                            :loading="isLoading"
                                            :disabled="isLoading"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-form>

                        </v-card-text>

                        <v-card-actions class="mt-n2 mr-4 bg-grey-lighten-5 justify-end" v-if="canManage">
                            <v-btn
                                color="primary"
                                variant="tonal"
                                rounded="lg"
                                min-width="140"
                                @click="handleEditGeneral"
                                :loading="isLoading"
                                :disabled="isLoading"
                            >
                                Enregistrer
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tabs-window-item>

                <v-tabs-window-item value="notifications">
                </v-tabs-window-item>

                <v-tabs-window-item value="api">
                </v-tabs-window-item>

                <v-tabs-window-item value="danger">
                    <v-card rounded="lg" border flat color="error-container">
                        <v-card-title class="pa-6 pb-1 text-h6 font-weight-bold text-error">
                            Zone de danger
                        </v-card-title>
                        <v-card-subtitle class="px-6 pb-4">
                            Ces actions sont irréversibles. Procédez avec précaution.
                        </v-card-subtitle>

                        <v-divider color="error" opacity="0.2" />

                        <v-card-text class="pa-6">
                            <div class="d-flex align-center justify-space-between">
                                <div>
                                    <div class="text-body-1 font-weight-medium">Supprimer l'organisation</div>
                                    <div class="text-body-2 text-medium-emphasis">
                                        Supprime définitivement l'organisation et toutes ses données.
                                    </div>
                                </div>

                                <v-btn color="error" variant="tonal" rounded="lg" min-width="140">
                                    Supprimer
                                </v-btn>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Organization } from "~/models/Organization";
import { OrganizationMemberRole } from "#shared/organization-roles";

useConfigPage("Paramètres");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const rules = useValidationRules();
const api = useApi();
const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;
const { currentOrganization } = useAuth();

const activeTab = ref("general");
const organization = ref<Partial<Organization>>({});

const form = ref();
const isFormValid = ref(false);
const logoInput = ref<HTMLInputElement | null>(null);

const isLoading = computed(() => api.isLoading('setting:detail') || api.isLoading('setting:update'));

const canManage = useOrganizationCan(OrganizationMemberRole.ADMIN);

const orgInitials = computed(() => getInitials(organization.value?.name));

const getGeneral = async () => {
    organization.value = await api.get<Organization>(`/tenant/${slugOrganization}/setting/details`, {
        loadingKey: 'setting:detail',
        toast: false
    });
};

onMounted(async () => {
    await getGeneral();
});

watch(activeTab, async () => {
    if (activeTab.value === "general") {
        await getGeneral();
    }
});

const triggerLogoInput = () => {
    logoInput.value?.click();
};

const handleLogoChange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
        return;
    }

    organization.value.logoUrl = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append('logo', file);

    const res = await api.post<{ logoUrl: string }>(`/tenant/${slugOrganization}/setting/logo`, formData, {
        loadingKey: 'setting:logo',
        toast: true,
    });

    organization.value.logoUrl = res.logoUrl;

    if (currentOrganization.value) {
        currentOrganization.value = { ...currentOrganization.value, logoUrl: res.logoUrl };
    }
};

const handleEditGeneral = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    await api.put(`/tenant/${slugOrganization}/setting`, {
        ...organization.value
    }, {
        loadingKey: 'setting:update',
        toast: true
    });
};
</script>

<style scoped>
.settings-tabs :deep(.v-list-item--active::before) {
    display: none;
}

.logo-upload {
    position: relative;
    cursor: pointer;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
}

.logo-avatar {
    display: block;
}

.logo-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.logo-upload:hover .logo-overlay {
    opacity: 1;
}

.logo-initials {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1;
    color: white;
}
</style>
