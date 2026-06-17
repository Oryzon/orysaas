<template>
    <NuxtLayout name="auth">
        <template #left>
            <h2 class="mt-n4 text-primary font-weight-black text-headline-small text-uppercase">
                Sécurité avant tout.
            </h2>

            <h1 class="mt-n4 text-white font-weight-bold text-display-large">
                Un nouveau départ, en toute sécurité.
            </h1>

            <h3 class="mt-n2 text-blue-grey-lighten-3">
                Choisissez un mot de passe fort.<br />
                Votre accès sera restauré en quelques secondes.
            </h3>
        </template>

        <template #right>
            <template v-if="!token">
                <h1>Lien invalide</h1>

                <h4 class="mb-6 text-blue-grey-lighten-3">
                    Ce lien de réinitialisation est invalide ou a expiré.
                </h4>

                <v-alert
                    type="error"
                    variant="tonal"
                    rounded="lg"
                    class="mb-6"
                    icon="mdi-link-variant-off"
                    text="Veuillez effectuer une nouvelle demande depuis la page de connexion."
                ></v-alert>

                <v-btn
                    block
                    variant="flat"
                    rounded="lg"
                    color="primary"
                    height="48"
                    to="/login"
                    prepend-icon="mdi-arrow-left"
                >
                    Retour à la connexion
                </v-btn>
            </template>

            <template v-else-if="done">
                <h1>Mot de passe mis à jour</h1>

                <h4 class="mb-6 text-blue-grey-lighten-3">
                    Votre mot de passe a été réinitialisé avec succès.
                </h4>

                <v-alert
                    type="success"
                    variant="tonal"
                    rounded="lg"
                    class="mb-6"
                    icon="mdi-check-circle-outline"
                    text="Vous pouvez dès maintenant vous connecter avec votre nouveau mot de passe."
                ></v-alert>

                <v-btn
                    block
                    variant="flat"
                    rounded="lg"
                    color="primary"
                    height="48"
                    to="/login"
                    append-icon="mdi-arrow-right"
                >
                    Se connecter
                </v-btn>
            </template>

            <template v-else>
                <h1>Nouveau mot de passe</h1>

                <h4>
                    Vous vous souvenez de votre mot de passe ?
                    <v-btn color="primary" variant="text" to="/login">Se connecter.</v-btn>
                </h4>

                <v-form ref="form" v-model="isFormValid">
                    <v-row class="mt-2">
                        <v-col md="12">
                            <v-text-field
                                hide-details="auto"
                                label="Nouveau mot de passe"
                                variant="outlined"
                                :type="showPassword ? 'text' : 'password'"
                                :rules="[ rules.required() ]"
                                v-model="newPassword"
                                :loading="isLoading"
                                :disabled="isLoading"
                                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showPassword = !showPassword"
                                @keyup.enter="handleSubmit"
                            ></v-text-field>

                            <auth-password-strength :password="newPassword"></auth-password-strength>
                        </v-col>

                        <v-col md="12" class="mt-n4">
                            <v-text-field
                                hide-details="auto"
                                label="Confirmer le mot de passe"
                                variant="outlined"
                                :type="showConfPassword ? 'text' : 'password'"
                                :rules="[ rules.required() ]"
                                v-model="confNewPassword"
                                :loading="isLoading"
                                :disabled="isLoading"
                                :append-inner-icon="showConfPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showConfPassword = !showConfPassword"
                                @keyup.enter="handleSubmit"
                            ></v-text-field>
                        </v-col>

                        <v-col md="12">
                            <v-btn
                                block
                                variant="flat"
                                rounded="lg"
                                color="primary"
                                height="48"
                                append-icon="mdi-lock-reset"
                                @click="handleSubmit"
                                :loading="isLoading"
                                :disabled="isLoading"
                            >
                                Réinitialiser mon mot de passe
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </template>
        </template>
    </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});

useConfigPage('Réinitialisation du mot de passe');

const { resetPassword } = useAuth();

const api = useApi();

const route = useRoute();
const token = computed(() => route.query.token as string | undefined);

const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();

const newPassword = ref('');
const confNewPassword = ref('');
const showPassword = ref(false);
const showConfPassword = ref(false);

const done = ref(false);

const isLoading = computed(() => api.isLoading('auth:reset-password'));

const handleSubmit = async () => {
    if (!token.value) {
        return;
    }

    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    try {
        await resetPassword({
            token: token.value,
            newPassword: newPassword.value,
            confNewPassword: confNewPassword.value,
        });

        done.value = true;
    } catch {
        // error already shown via toast
    }
};
</script>