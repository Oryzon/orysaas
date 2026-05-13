<template>
    <NuxtLayout name="auth">
        <template #left>
            <h2 class="mt-n4 text-primary font-weight-black text-headline-small">Bienvenue à bord</h2>

            <h1 class="mt-n4 text-white font-weight-bold text-display-large">Lancez votre Saas en quelque jours.</h1>

            <h3 class="mt-n2 text-blue-grey-lighten-3">Pas de CB. 14 jours d'essai. Aucun engagement.<br />Vous pouvez tester aujourd'hui.</h3>
        </template>

        <template #right>
            <h1>Créer un compte</h1>

            <h4>Déjà inscrit ? <v-btn color="primary" variant="text" to="login">Se connecter</v-btn></h4>

            <v-divider>OU</v-divider>

            <v-form ref="form" v-model="isFormValid">
                <v-row class="mt-2">
                    <v-col md="6">
                        <v-text-field
                            hide-details="auto"
                            label="Nom"
                            variant="outlined"
                            :rules="[ rules.required() ]"
                            v-model="user.lastname"
                        ></v-text-field>
                    </v-col>

                    <v-col md="6">
                        <v-text-field
                            hide-details="auto"
                            label="Prénom"
                            variant="outlined"
                            :rules="[ rules.required() ]"
                            v-model="user.firstname"
                        ></v-text-field>
                    </v-col>

                    <v-col md="12" class="mt-n4">
                        <v-text-field
                            hide-details="auto"
                            label="E-mail"
                            variant="outlined"
                            :rules="[ rules.required() ]"
                            v-model="user.email"
                        ></v-text-field>
                    </v-col>

                    <v-col md="12" class="mt-n4">
                        <v-text-field
                            v-model="user.password"
                            hide-details="auto"
                            label="Mot de passe"
                            variant="outlined"
                            :rules="[ rules.required() ]"
                            type="password"
                        ></v-text-field>

                        <auth-password-strength
                            :password="user.password"
                        ></auth-password-strength>
                    </v-col>

                    <v-col md="12" class="mt-n6 ml-n3">
                        <v-checkbox label="J'accepte les CGU et la politique de confidentialité." color="primary"></v-checkbox>
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
import type { User } from "~/models/User";

const api = useApi();

useConfigPage('Inscription');

definePageMeta({
    layout: false
});

const router = useRouter();
const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
const user = ref<Partial<User>>({});

const handleRegister = async () => {
    const { valid } = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    let res = await api.post<{ message: string }>(`auth/register`,
        { ...user.value },
        {
            loadingKey: 'auth:register',
            toast: true
        });

    if (res['message'] === "L'utilisateur a bien été crée.") {
        await router.replace('/admin/login'); // fast, replaces history
    }
}
</script>