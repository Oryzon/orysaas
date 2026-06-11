<template>
    <v-dialog v-model="dialog" max-width="1000" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-card v-if="outlined" v-bind="activatorProps" variant="outlined" color="primary" class="mt-2" rounded="lg">
                <v-card-text>
                    <v-row justify="center" align="center" class="mt-n1 mb-n1">
                        <v-col md="2">
                            <v-avatar size="36" rounded="lg" class="flex-shrink-0">
                                <v-icon color="primary">mdi-folder-plus</v-icon>
                            </v-avatar>
                        </v-col>

                        <v-col md="10">
                            <h3>Créer une nouvelle organisation</h3>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <v-btn
                v-else
                v-bind="activatorProps"
                color="primary"
                variant="flat"
                rounded="lg"
                class="mt-2 px-5 text-none"
                prepend-icon="mdi-folder-plus"
            >
                Créer une nouvelle organisation
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card flat>
                <v-toolbar color="primary">
                    <v-toolbar-title>Création d'une nouvelle organisation</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form ref="form" v-model="isFormValid">
                        <v-row>
                            <v-col cols="12" md="7">
                                <v-text-field
                                    hide-details="auto"
                                    label="Nom de l'organisation"
                                    variant="outlined"
                                    v-model="organization.name"
                                    :rules="[rules.required(), rules.minLength(2)]"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="5">
                                <v-file-input
                                    accept="image/*"
                                    label="Logo"
                                    variant="outlined"
                                    hide-details="auto"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    v-model="logoFile"
                                ></v-file-input>
                            </v-col>

                            <v-col cols="12" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    label="Adresse"
                                    variant="outlined"
                                    v-model="organization.address"
                                    :rules="[rules.required()]"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="3" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    label="Code postal"
                                    variant="outlined"
                                    v-model="organization.postalCode"
                                    :rules="[rules.required()]"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="5" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    label="Ville"
                                    variant="outlined"
                                    v-model="organization.city"
                                    :rules="[rules.required()]"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    label="Pays"
                                    variant="outlined"
                                    v-model="organization.country"
                                    :rules="[rules.required()]"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-btn color="primary" variant="flat" :loading="isLoading" :disabled="!isFormValid || isLoading" @click="handleCreate">
                        Créer l'organisation
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { Organization } from "~/models/Organization";

const props = defineProps({
    outlined: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["created"]);

const api = useApi();
const rules = useValidationRules();

const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const isLoading = computed(() => api.isLoading("organization:create"));

const organization = ref<Partial<Organization>>({});
const logoFile = ref<File | null>(null);

const handleClose = () => {
    dialog.value = false;
    organization.value = {};
    logoFile.value = null;

    form.value?.reset();
};

const handleCreate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const formData = new FormData();
    formData.append("name", organization.value.name ?? "");
    formData.append("address", organization.value.address ?? "");
    formData.append("postalCode", organization.value.postalCode ?? "");
    formData.append("city", organization.value.city ?? "");
    formData.append("country", organization.value.country ?? "");

    if (logoFile.value) {
        formData.append("logo", logoFile.value);
    }

    const res = await api.post<{ message: string; entity: Organization }>("/organizations", formData, {
        loadingKey: "organization:create",
        toast: true,
    });

    if (res?.entity) {
        emit("created", res.entity);
        handleClose();
    }
};
</script>
