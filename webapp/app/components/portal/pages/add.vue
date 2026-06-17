<template>
    <v-dialog v-model="dialog" max-width="1200" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="flat"
                color="primary"
                prepend-icon="mdi-plus"
            >
                Créer
            </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="isLoading">
                <v-toolbar color="primary">
                    <v-toolbar-title>Création d'une page</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form
                        ref="form"
                        v-model="isFormValid"
                    >
                        <v-row>
                            <v-col md="6">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Titre"
                                    v-model="page.title"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                ></v-text-field>
                            </v-col>

                            <v-col md="6">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Slug"
                                    v-model="page.slug"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Meta-Titre"
                                    v-model="page.metaTitle"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-textarea
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Meta-Description"
                                    v-model="page.metaDescription"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    rows="3"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2" >
                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        @click="handleCreate"
                        :disabled="!isFormValid"
                    >Créer</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import { type Page } from "~/models/Page";

const api = useApi();
const dialog = ref(false);

const emit = defineEmits(['created']);

const isLoading = computed(() => {
    return api.isLoading('page:create');
});

const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
let page = ref<Partial<Page>>({});

const handleClose = () => {
    dialog.value = false;
    page.value = {};
};

const handleCreate = async () => {
    const { valid } = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    let res = await api.post<{message: string, entity: Page}>(`/page`,
        { ...page.value },
        {
            loadingKey: 'page:create',
            toast: true
        });

    emit("created", res.entity);
    handleClose();
}
</script>