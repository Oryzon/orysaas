<template>
    <NuxtLayout name="auth">
        <template #left>
            <h2 class="mt-n4 text-primary font-weight-black text-headline-small">Heureux de vous revoir.</h2>

            <h1 class="mt-n4 text-white font-weight-bold text-display-large">Reprenez là où vous l'avez laissé.</h1>

            <h3 class="mt-n2 text-blue-grey-lighten-3">Votre dashboard, vos utilisateurs, vos métriques.<br /> Tout est resté en place.</h3>

            <v-card rounded="lg" variant="outlined" class="card-glass" color="white">
                <v-card-text class="text-headline-small font-weight-black px-6 pt-6 pb-4">
                    « Le seul outil dont j'ai vraiment eu besoin pour lancer en prod. »
                </v-card-text>

                <v-card-actions class="px-4 pb-4">
                    <v-list-item class="w-100">
                        <template v-slot:prepend>
                            <v-avatar
                                class="gradient-primary"
                                text="VB"
                            ></v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-black">Vincent BOULANGER</v-list-item-title>

                        <v-list-item-subtitle>Président - OryScorp</v-list-item-subtitle>
                    </v-list-item>
                </v-card-actions>
            </v-card>
        </template>

        <template #right>
            <v-alert
                v-if="verification.message"
                :type="verification.success ? 'success' : 'error'"
                :text="verification.message"
                variant="tonal"
                rounded="lg"
                class="mb-4"
                closable
            ></v-alert>

            <h1>Connexion</h1>

            <h4>Vous n'avez pas encore de compte ? <v-btn color="primary" variant="text" to="register">S'inscrire.</v-btn></h4>

            <v-divider>OU</v-divider>

            <v-form ref="form" v-model="isFormValid">
                <v-row class="mt-2">
                    <v-col md="12">
                        <v-text-field
                            hide-details="auto"
                            label="Email"
                            variant="outlined"
                            :rules="[ rules.required() ]"
                            v-model="user.email"
                        ></v-text-field>
                    </v-col>

                    <v-col md="12" class="mt-n4">
                        <v-text-field
                            hide-details="auto"
                            label="Mot de passe"
                            variant="outlined"
                            :rules="[ rules.required() ]"
                            type="password"
                            v-model="user.password"
                        ></v-text-field>
                    </v-col>

                    <v-col md="6" class="mt-n6 ml-n3">
                        <v-checkbox label="Resté connecté ?" color="primary"></v-checkbox>
                    </v-col>

                    <v-col md="6" class="mt-n3 text-right">
                        <v-btn class="mr-n3" variant="tonal" color="primary">Mot de passe oublié ?</v-btn>
                    </v-col>

                    <v-col md="12" class="mt-n8">
                        <v-btn
                            block
                            variant="flat"
                            rounded="lg"
                            color="primary"
                            height="48"
                            append-icon="mdi-arrow-right"
                            @click="handleLogin"
                        >
                            Se connecter
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

useConfigPage('Connexion');

definePageMeta({
    layout: false
});

const route = useRoute();
const router = useRouter();

const { login, loggedIn } = useAuth();
const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
const user = ref<Partial<User>>({});

const verification = reactive({ success: false, message: '' });

onMounted(async () => {
    const token = route.query.token as string;

    if (!token) {
        return;
    }

    await router.replace({ query: {} });

    let res = <any><unknown>await api.get(`auth/verify?token=${token}`,
        {
            loadingKey: 'auth:verify',
            toast: true
        });

    verification.success = true;
    verification.message = res.message;
});

const handleLogin = async () => {
    let res = <any><unknown>await login({
        email: user.value.email,
        password: user.value.password
    });

    await router.replace('/portal/dashboard/'); // fast, replaces history
}
</script>

<style scoped>
.card-glass {
    background: rgba(95, 95, 103, 0.30) !important;
    backdrop-filter: blur(12px);
}
</style>
