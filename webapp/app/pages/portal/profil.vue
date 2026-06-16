<template>
    <v-row>
        <v-col cols="12" md="8">
            <v-card flat border rounded="lg" :loading="isLoadingProfile">
                <div class="d-flex align-center justify-space-between px-6 pt-6 pb-1">
                    <div>
                        <div class="text-h6 font-weight-bold">Informations personnelles</div>
                        <div class="text-body-2 text-medium-emphasis mt-1">Modifiez votre prénom et votre nom.</div>
                    </div>

                    <v-avatar size="56" rounded="lg" class="gradient-primary flex-shrink-0">
                        {{ getInitials(`${user?.firstname ?? ''} ${user?.lastname ?? ''}`) }}
                    </v-avatar>
                </div>

                <v-divider class="mt-4"></v-divider>

                <v-card-text class="pa-6">
                    <v-form ref="profileFormRef" v-model="isProfileFormValid">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    label="Prénom"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="profileForm.firstname"
                                    :rules="[ rules.required() ]"
                                    :loading="isLoadingProfile"
                                    :disabled="isLoadingProfile"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field
                                    label="Nom"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="profileForm.lastname"
                                    :rules="[ rules.required() ]"
                                    :loading="isLoadingProfile"
                                    :disabled="isLoadingProfile"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" class="mt-n2">
                                <v-text-field
                                    label="Adresse e-mail"
                                    variant="outlined"
                                    hide-details="auto"
                                    :model-value="user?.email"
                                    readonly
                                    :append-inner-icon="'mdi-lock-outline'"
                                >
                                    <template #message>
                                        <span class="text-caption text-medium-emphasis">L'adresse e-mail ne peut pas être modifiée.</span>
                                    </template>
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="mt-n2 bg-grey-lighten-5 justify-end">
                    <v-btn
                        color="primary"
                        variant="tonal"
                        rounded="lg"
                        min-width="140"
                        :loading="isLoadingProfile"
                        :disabled="isLoadingProfile || !isProfileFormValid"
                        @click="handleSaveProfile"
                    >
                        Enregistrer
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card v-if="isLocal" flat border rounded="lg" :loading="isLoadingPassword" class="mt-4">
                <div class="px-6 pt-6 pb-1">
                    <div class="text-h6 font-weight-bold">Mot de passe</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">Choisissez un nouveau mot de passe pour sécuriser votre compte.</div>
                </div>

                <v-divider class="mt-4"></v-divider>

                <v-card-text class="pa-6">
                    <v-form ref="passwordFormRef" v-model="isPasswordFormValid">
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    label="Mot de passe actuel"
                                    variant="outlined"
                                    hide-details="auto"
                                    type="password"
                                    v-model="passwordForm.currentPassword"
                                    :rules="[ rules.required() ]"
                                    :loading="isLoadingPassword"
                                    :disabled="isLoadingPassword"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" class="mt-n2">
                                <v-text-field
                                    label="Nouveau mot de passe"
                                    variant="outlined"
                                    hide-details="auto"
                                    type="password"
                                    v-model="passwordForm.newPassword"
                                    :rules="[ rules.required(), rules.minLength(8) ]"
                                    :loading="isLoadingPassword"
                                    :disabled="isLoadingPassword"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" class="mt-n2">
                                <v-text-field
                                    label="Confirmer le nouveau mot de passe"
                                    variant="outlined"
                                    hide-details="auto"
                                    type="password"
                                    v-model="passwordForm.confNewPassword"
                                    :rules="[ rules.required(), rules.isSameAs(() => passwordForm.newPassword, 'Les mots de passe ne correspondent pas.') ]"
                                    :loading="isLoadingPassword"
                                    :disabled="isLoadingPassword"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="mt-n2 bg-grey-lighten-5 justify-end">
                    <v-btn
                        color="primary"
                        variant="tonal"
                        rounded="lg"
                        min-width="140"
                        :loading="isLoadingPassword"
                        :disabled="isLoadingPassword || !isPasswordFormValid"
                        @click="handleChangePassword"
                    >
                        Modifier le mot de passe
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>

        <v-col cols="12" md="4">
            <v-card flat border rounded="lg">
                <div class="px-6 pt-6 pb-1">
                    <div class="text-subtitle-1 font-weight-bold">Mon compte</div>
                </div>

                <v-divider class="mt-4"></v-divider>

                <v-card-text class="pa-6">
                    <div class="d-flex flex-column ga-4">
                        <div>
                            <div class="text-caption text-medium-emphasis mb-1">Origine du compte</div>
                            <v-chip
                                label
                                :color="getUserOriginColor(user?.origin)"
                                variant="tonal"
                                size="small"
                                rounded="lg"
                            >
                                {{ getUserOriginLabel(user?.origin) }}
                            </v-chip>
                        </div>

                        <div>
                            <div class="text-caption text-medium-emphasis mb-1">Statut</div>
                            <v-chip
                                label
                                :color="user?.isActive ? 'success' : 'error'"
                                variant="tonal"
                                size="small"
                                rounded="lg"
                                :prepend-icon="user?.isActive ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                            >
                                {{ user?.isActive ? 'Actif' : 'Inactif' }}
                            </v-chip>
                        </div>

                        <div v-if="user?.isSaasAdmin">
                            <div class="text-caption text-medium-emphasis mb-1">Rôle</div>
                            <v-chip label color="warning" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-shield-crown-outline">
                                Administrateur SaaS
                            </v-chip>
                        </div>

                        <div>
                            <div class="text-caption text-medium-emphasis mb-1">Membre depuis</div>
                            <div class="text-body-2">{{ user?.createdAt ? $date.french(user.createdAt) : '—' }}</div>
                        </div>

                        <div>
                            <div class="text-caption text-medium-emphasis mb-1">Dernière connexion</div>
                            <div class="text-body-2">{{ user?.lastLogin ? $date.french(user.lastLogin) : 'Jamais' }}</div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>
import { UserOrigin, getUserOriginColor, getUserOriginLabel } from "~/models/User";

const api = useApi();
const rules = useValidationRules();
const { user, refreshUser } = useAuth();

useConfigPage("Mon profil");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLocal = computed(() => user.value?.origin === UserOrigin.LOCAL);
const isLoadingProfile = computed(() => api.isLoading('profile:update'));
const isLoadingPassword = computed(() => api.isLoading('profile:password'));

const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confNewPassword: '',
});

const profileFormRef = ref();
const passwordFormRef = ref();
const isProfileFormValid = ref(false);
const isPasswordFormValid = ref(false);

const profileForm = ref({
    firstname: user.value?.firstname ?? '',
    lastname: user.value?.lastname ?? '',
});

const handleSaveProfile = async () => {
    const { valid } = await profileFormRef.value.validate();

    if (!valid) {
        return;
    }

    await api.put('/user/me', profileForm.value, {
        loadingKey: 'profile:update',
        toast: true,
    });

    await refreshUser();
};

const handleChangePassword = async () => {
    const { valid } = await passwordFormRef.value.validate();

    if (!valid) {
        return;
    }

    await api.put('/user/me/password', {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
    }, {
        loadingKey: 'profile:password',
        toast: true,
    });

    passwordForm.value = { currentPassword: '', newPassword: '', confNewPassword: '' };
    passwordFormRef.value.resetValidation();
};
</script>