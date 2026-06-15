<template>
    <v-row>
        <v-col md="8">
            <v-card flat :loading="isLoading">
                <div class="px-6 pt-6 pb-1">
                    <div class="text-h6 font-weight-bold">Paramètres de la plateforme</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">Informations légales et de contact de votre société.</div>
                </div>

                <v-divider class="mt-4" />

                <v-card-text class="pa-6">
                    <v-form
                        ref="form"
                        v-model="isFormValid"
                    >


                        <v-row>
                            <v-col md="12">
                                <div class="text-subtitle-2 font-weight-bold">Informations légales</div>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    label="Forme juridique"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.legalForm"
                                    :rules="[ rules.required() ]"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    label="Capital social"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.shareCapital"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    label="Code NAF / APE"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.nafApeCode"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" class="mt-n2">
                                <v-text-field
                                    label="SIRET"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.siret"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6" class="mt-n2">
                                <v-text-field
                                    label="Identifiant TVA intracommunautaire"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.identifierVat"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12" class="mt-n2">
                                <v-text-field
                                    label="Ville du RCS"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.rcsCity"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12">
                                <v-divider class="mt-n2 my-5" />

                                <div class="text-subtitle-2 font-weight-bold">Adresse</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field
                                    label="Adresse postale"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.adress"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2">
                                <v-text-field
                                    label="Code postal"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.postalCode"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-text-field
                                    label="Ville"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.city"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12">
                                <v-divider class="mt-n2 my-5" />

                                <div class="text-subtitle-2 font-weight-bold">Contact</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field
                                    label="Email"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.email"
                                    :rules="[rules.isEmail()]"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field
                                    label="Téléphone"
                                    variant="outlined"
                                    hide-details="auto"
                                    v-model="settings.phone"
                                    :rules="[rules.isPhoneNumber()]"
                                    :disabled="isLoading"
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
                        :loading="isLoading"
                        :disabled="isLoading || !isFormValid"
                        @click="handleSave"
                    >
                        Enregistrer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>

        <v-col md="4">
            <v-card flat :loading="isLoading">
                <div class="px-6 pt-6 pb-1">
                    <div class="text-h6 font-weight-bold">Clé d'API</div>
                    <div class="text-body-2 text-medium-emphasis mt-1">Les clés nécessaire pour le bon fonctionnement du SaaS.</div>
                </div>

                <v-divider class="mt-4" />

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            @ToDo
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>
import type { Setting } from "~/models/Setting";

const api = useApi();
const rules = useValidationRules();

useConfigPage("Paramètres");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const form = ref();
const isFormValid = ref(false);
const settings = ref<Partial<Setting>>({});

const isLoading = computed(() => api.isLoading('settings:list') || api.isLoading('settings:update'));

onMounted(async () => {
    settings.value = await api.get<Setting>('settings', {
        loadingKey: 'settings:list',
        toast: false,
    });
});

const handleSave = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    await api.put('settings', settings.value, {
        loadingKey: 'settings:update',
        toast: true,
    });
};
</script>