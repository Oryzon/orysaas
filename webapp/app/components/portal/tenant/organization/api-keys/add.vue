<template>
    <v-dialog v-model="dialog" max-width="500" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="tonal"
                color="primary"
                icon
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="primary">
                    <v-toolbar-title>Nouvelle clé d'API</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form ref="form" v-model="isFormValid">
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Label"
                                    v-model="newKey.label"
                                    :disabled="isLoading"
                                    :rules="[rules.required(), rules.minLength(2)]"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" class="mt-n4">
                                <v-select
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Type"
                                    v-model="newKey.type"
                                    :items="API_KEY_TYPES"
                                    :disabled="isLoading"
                                    :rules="[rules.required()]"
                                ></v-select>
                            </v-col>

                            <v-col cols="12" class="mt-n4">
                                <v-select
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Système"
                                    v-model="newKey.systemKey"
                                    :items="ApiKeySystemSelect"
                                    :disabled="isLoading"
                                    :rules="[rules.required()]"
                                ></v-select>
                            </v-col>

                            <v-col cols="12" class="mt-n4" v-if="newKey.type === 'INTEGRATION'">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Valeur de la clé"
                                    v-model="newKey.value"
                                    :disabled="isLoading"
                                    :rules="[rules.required()]"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Expiration (optionnelle)"
                                    type="date"
                                    v-model="newKey.expiresAt"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n4">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        :disabled="!isFormValid || isLoading"
                        @click="handleCreate"
                    >
                        Créer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type {ApiKey} from "~/models/ApiKey";
import { API_KEY_SYSTEMS } from "#shared/api-key-systems";

const API_KEY_TYPES = [
    { title: "Intégration (clé d'un système externe)", value: "INTEGRATION" },
    { title: "Consommateur (clé générée pour un système externe)", value: "CONSUMER" },
];

const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;

const api = useApi();
const rules = useValidationRules();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const newKey = ref<Partial<ApiKey>>({});

const emit = defineEmits(['created']);

const isLoading = computed(() => api.isLoading('api-key:create'));

const ApiKeySystemSelect = computed(() => {
    return Object.entries(API_KEY_SYSTEMS).map(([key, {label}]) => ({
        title: label,
        value: key
    }));
});

const handleClose = () => {
    dialog.value = false;
    newKey.value = {};
};

const handleCreate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.post<{ entity: ApiKey }>(`/tenant/${slugOrganization}/setting/api-key`, newKey.value, {
        loadingKey: 'api-key:create',
        toast: true,
    });

    emit('created', res.entity);
    handleClose();
};
</script>