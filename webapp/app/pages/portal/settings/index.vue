<template>
    <v-row>
        <v-col md="7">
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

        <v-col md="5">
            <v-card flat :loading="isLoading">
                <div class="px-6 pt-6 pb-1 d-flex align-center justify-space-between">
                    <div>
                        <div class="text-h6 font-weight-bold">
                          Clés d'API
                        </div>

                        <div class="text-body-2 text-medium-emphasis mt-1">Les clés nécessaires au bon fonctionnement du SaaS.</div>
                    </div>

                  <portal-settings-api-key-add
                      @created="addToApiKeys"
                  ></portal-settings-api-key-add>
                </div>

                <v-divider class="mt-4" />

              <v-card-text>
                <v-row>
                  <v-col md="12">
                    <v-data-table
                        :headers="headers"
                        :items="apiKeys"
                        :items-per-page="100"
                        hide-default-footer
                        density="compact"
                        no-data-text="Aucune clé d'API configurée."
                    >
                      <template v-slot:item.type="{ item }">
                        <v-chip
                            variant="tonal"
                            :color="(item as ApiKey).type === 'INTEGRATION' ? 'info' : 'secondary'"
                        >
                          {{ (item as ApiKey).type === 'INTEGRATION' ? 'Intégration' : 'Consommateur' }}
                        </v-chip>
                      </template>

                      <template v-slot:item.expiresAt="{ item }">
                        <v-chip
                            v-if="item.expiresAt"
                            variant="tonal"
                            :color="isExpired(item.expiresAt) ? 'error' : 'warning'"
                        >
                          {{ isExpired(item.expiresAt) ? 'Expirée' : $date.frenchDate(item.expiresAt) }}
                        </v-chip>

                        <span v-else class="text-medium-emphasis text-caption">-</span>
                      </template>

                      <template v-slot:item.actions="{ item }">
                          <portal-settings-api-key-view
                              :entity="item"
                          ></portal-settings-api-key-view>

                          <portal-settings-api-key-remove
                              :entity="item"
                              @removed="removeToApiKey"
                          ></portal-settings-api-key-remove>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>
import type { Setting } from "~/models/Setting";
import type { ApiKey } from "~/models/ApiKey";
import type {ApiKeySystem} from "#shared/api-key-systems";

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
const apiKeys = ref<ApiKey[]>([]);

const isLoading = computed(() => api.isLoading('settings:list') || api.isLoading('settings:update'));

onMounted(async () => {
    const data = await api.get<Setting>('settings', {
        loadingKey: 'settings:list',
        toast: false,
    });

    apiKeys.value = data.apiKeys ?? [];
    settings.value = data;
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

const headers = [
    { title: 'Label', key: 'label' },
    { title: 'Type', key: 'type' },
    { title: 'Expiration', key: 'expiresAt' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
];

const addToApiKeys = (data: ApiKey) => {
    apiKeys.value.push(data);
};

const removeToApiKey = (data: ApiKey) => {
    apiKeys.value = apiKeys.value.filter((entity) => entity.uuid !== data.uuid);
}

const isExpired = (date: string) => new Date(date) < new Date();
</script>