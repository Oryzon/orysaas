<template>
    <v-dialog max-width="600" v-model="dialog">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="tonal"
                color="primary"
                class="mr-n3"
            >
                Mot de passe oublié ?
            </v-btn>
        </template>

        <v-card :loading="api.isLoading('auth:forgot-password')">
            <v-toolbar>
                <v-toolbar-title>Mot de passe oublié</v-toolbar-title>

                <v-toolbar-items>
                    <v-btn icon @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-alert type="info" variant="tonal" class="mb-2">
                            Saisissez votre adresse e-mail. Si elle est associée à un compte, vous recevrez un lien de réinitialisation valable <strong>1 heure</strong>.
                        </v-alert>
                    </v-col>

                    <v-col cols="12" v-if="!sent" class="mt-n4">
                        <v-text-field
                            label="Adresse e-mail"
                            variant="outlined"
                            type="email"
                            v-model="email"
                            prepend-inner-icon="mdi-email-outline"
                            :loading="api.isLoading('auth:forgot-password')"
                            :disabled="api.isLoading('auth:forgot-password')"
                            @keyup.enter="handleSubmit"
                            hide-details
                        ></v-text-field>
                    </v-col>

                    <v-col cols="12" v-else class="mt-n4">
                        <v-alert type="success" variant="tonal">
                            Si cet e-mail est associé à un compte, vous recevrez un lien dans quelques instants. Pensez à vérifier vos spams.
                        </v-alert>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions class="bg-surface-light">
                <v-btn variant="text" color="error" @click="dialog = false">
                    Fermer
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn
                    v-if="!sent"
                    color="primary"
                    variant="flat"
                    @click="handleSubmit"
                    :loading="api.isLoading('auth:forgot-password')"
                    :disabled="api.isLoading('auth:forgot-password')"
                >
                    Envoyer&nbsp;
                    <v-icon>mdi-send</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref(false);

const { forgotPassword } = useAuth();
const api = useApi();

const email = ref<string>('');
const sent = ref<boolean>(false);

watch(dialog, (val) => {
    if (!val) {
        email.value = '';
        sent.value = false;
    }
});

const handleSubmit = async () => {
    if (!email.value) return;

    try {
        await forgotPassword({ email: email.value });

        sent.value = true;
    } catch {
        // error shown via toast
    }
};
</script>