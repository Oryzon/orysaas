<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                color="dark"
            >
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="isLoading">
                <v-toolbar>
                    <v-toolbar-title>Rechercher dans les pages</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="error">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form
                        ref="form"
                        v-model="isFormValid"
                    >
                        <v-row>
                            <v-col md="12">
                                <v-select
                                    label="Page du site"
                                    variant="outlined"
                                    :items="pages"
                                    item-title="title"
                                    item-value="slug"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    v-model="selectedSlug"
                                ></v-select>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n6">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        @click="handleUse"
                        :disabled="!isFormValid"
                    >Selectionner</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { Page } from "~/models/Page";

const api = useApi();
const dialog = ref(false);

const emit = defineEmits(['selected']);

const isLoading = computed(() => {
    return api.isLoading('pages:search');
});

const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
const selectedSlug = ref<string>();

let pages = ref<Array<Page>>([]);

watch(dialog, async (newVal) => {
    if (newVal) {
        pages.value = await api.get<Array<Page>>('/pages', { loadingKey: 'pages:search'});
    }
})

const handleClose = () => {
    dialog.value = false;
    selectedSlug.value = undefined;
    pages.value = [];
}

const handleUse = async () => {
    const { valid } = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    emit('selected', selectedSlug.value);
    handleClose();
}
</script>