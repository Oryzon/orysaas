<template>
    <NuxtLayout name="auth">
        <template #left>
            <h2
                class="mt-n4 text-primary font-weight-black text-headline-small text-uppercase"
            >
                Bienvenue à bord.
            </h2>

            <h1 class="mt-n4 text-white font-weight-bold text-display-large">
                Lancez votre Saas en quelque jours.
            </h1>

            <h3 class="mt-n2 text-blue-grey-lighten-3">
                Pas de CB. 14 jours d'essai. Aucun engagement.<br />Vous pouvez
                tester aujourd'hui.
            </h3>
        </template>

        <template #right>
            <v-alert
                v-if="inviteOrganizationName"
                type="info"
                variant="tonal"
                rounded="lg"
                class="mb-4"
                icon="mdi-account-plus"
            >
                Vous avez été invité à rejoindre <strong>{{ inviteOrganizationName }}</strong>.<br />
                Créez votre compte pour rejoindre l'équipe.
            </v-alert>

            <h1>Créer un compte</h1>

            <h4>
                Déjà inscrit ?
                <v-btn color="primary" variant="text" to="login"
                    >Se connecter</v-btn
                >
            </h4>

            <providers-banner />

            <v-divider>OU</v-divider>

            <v-form ref="form" v-model="isFormValid">
                <v-row class="mt-2">
                    <v-col md="6">
                        <v-text-field
                            hide-details="auto"
                            label="Nom"
                            variant="outlined"
                            :rules="[rules.required()]"
                            v-model="user.lastname"
                            :loading="isLoading"
                            :disabled="isLoading"
                        ></v-text-field>
                    </v-col>

                    <v-col md="6">
                        <v-text-field
                            hide-details="auto"
                            label="Prénom"
                            variant="outlined"
                            :rules="[rules.required()]"
                            v-model="user.firstname"
                            :loading="isLoading"
                            :disabled="isLoading"
                        ></v-text-field>
                    </v-col>

                    <v-col md="12" class="mt-n4">
                        <v-text-field
                            hide-details="auto"
                            label="E-mail"
                            variant="outlined"
                            :rules="[rules.required()]"
                            v-model="user.email"
                            :loading="isLoading"
                            :disabled="isLoading || inviteEmailLocked"
                            :readonly="inviteEmailLocked"
                        ></v-text-field>
                    </v-col>

                    <v-col md="12" class="mt-n4">
                        <v-text-field
                            v-model="user.password"
                            hide-details="auto"
                            label="Mot de passe"
                            variant="outlined"
                            :rules="[rules.required()]"
                            type="password"
                            :loading="isLoading"
                            :disabled="isLoading"
                        ></v-text-field>

                        <auth-password-strength
                            :password="user.password"
                        ></auth-password-strength>
                    </v-col>

                    <v-col md="12" class="mt-n6 ml-n3">
                        <v-checkbox
                            label="J'accepte les CGU et la politique de confidentialité."
                            color="primary"
                            :loading="isLoading"
                            :disabled="isLoading"
                        ></v-checkbox>
                    </v-col>

                    <v-col md="12" class="mt-n8">
                        <v-btn
                            block
                            variant="flat"
                            rounded="lg"
                            color="primary"
                            height="48"
                            append-icon="mdi-rocket-launch"
                            @click="handleRegister"
                            :loading="isLoading"
                            :disabled="isLoading"
                        >
                            Créer mon compte gratuit
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </template>
    </NuxtLayout>
</template>

<script setup lang="ts">
import ProvidersBanner from "~/components/auth/providers-banner.vue";
import type { User } from "~/models/User";

const api = useApi();

useConfigPage("Inscription");

definePageMeta({
    layout: false,
});

const route = useRoute();
const router = useRouter();
const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
const user = ref<Partial<User>>({});
const inviteOrganizationName = ref<string | null>(null);
const inviteEmailLocked = ref(false);

const isLoading = computed(() => api.isLoading("auth:register"));

onMounted(async () => {
    const inviteToken = route.query.inviteToken as string | undefined;

    if (!inviteToken) {
        return;
    }

    const info = await api.get<{ organizationName: string; email: string }>(
        `/auth/invite/check?token=${inviteToken}`,
        { auth: false, toast: false },
    );

    if (info) {
        inviteOrganizationName.value = info.organizationName;
        user.value.email = info.email;
        inviteEmailLocked.value = true;
    }
});

const handleRegister = async () => {
    const { valid } = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    const res = await api.post<{ message: string }>(
        `auth/register`,
        { ...user.value },
        {
            loadingKey: "auth:register",
            toast: true,
        },
    );

    if (res) {
        await router.replace("/login");
    }
};
</script>
