<template>
    <v-row>
        <v-col md="12">
            <v-card flat :loading="isLoading">
                <v-card-text>
                    <v-form
                        ref="form"
                        v-model="isFormValid"
                    >
                        <v-row>
                            <v-col md="3">
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

                            <v-col md="3">
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

                            <v-col md="3">
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

                            <v-col md="3" class="mb-n5">
                                <v-switch
                                    class="float-right"
                                    label="Page publiée ?"
                                    inset="square"
                                    color="success"
                                    v-model="page.isPublished"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-switch>
                            </v-col>

                            <v-col md="12" class="mt-n2">
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
            </v-card>
        </v-col>

        <v-col md="12" class="mt-n2">
            <portal-blocks-ui-editor v-model="page.blocks" />
        </v-col>

        <v-fab
            class="mr-1 mt-n6"
            absolute
            location="bottom right"
            color="success"
            icon="mdi-content-save"
            @click="handleUpdate()"
        ></v-fab>
    </v-row>
</template>

<script setup lang="ts">
import { type Page } from "~/models/Page";

const api = useApi();

useConfigPage("Modifier une page");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const route = useRouter().currentRoute.value;

const isLoading = computed(() => {
    return api.isLoading('page:detail');
});

const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();

let page = ref<Partial<Page>>({ blocks: [] });
let originalPage = ref<Partial<Page>>({});

onMounted(async () => {
    page.value = await api.get<Page>(`page/${<string>route.params.uuid}`, {
        loadingKey: 'page:detail'
    });

    originalPage.value = JSON.parse(JSON.stringify(page.value));
});

const handleUpdate = async () => {
    const { valid } = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    let res = await api.put(`/page/${<string>route.params.uuid}`, page.value, {
        loadingKey: 'page:detail',
        toast: true
    });

    if (res) {
        originalPage.value = JSON.parse(JSON.stringify(page.value));
    }
}
</script>
