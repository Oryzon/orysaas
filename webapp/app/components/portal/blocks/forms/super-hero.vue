<template>
    <v-row>
        <!-- Dernières modifications -->
        <v-col md="12">
            <h3 class="text-h6 mb-1">Dernières modifications</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">Bandeau affiché en haut du hero pour valoriser une nouveauté.</p>
        </v-col>

        <v-col md="2">
            <v-text-field
                v-model="localData.lastChanges.versionNo"
                label="Version"
                placeholder="v1.2"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="7">
            <v-text-field
                v-model="localData.lastChanges.title"
                label="Description du changement"
                placeholder="Auth, billing, onboarding..."
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="3">
            <v-text-field
                v-model="localData.lastChanges.url"
                label="Lien changelog"
                placeholder="/changelog"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="12" class="mt-n4">
            <v-divider></v-divider>
        </v-col>

        <v-col md="6">
            <h3 class="text-h6 mb-4 mt-n2">Information principales</h3>

            <v-text-field
                v-model="localData.title"
                label="Titre principal"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>

            <v-textarea
                v-model="localData.subtitle"
                label="Sous-titre (optionnel)"
                variant="outlined"
                rows="3"
                class="mt-n2"
                @update:model-value="emitUpdate"
            ></v-textarea>

            <h3 class="text-h6 mb-4">Capture d'écran du SaaS</h3>

            <v-card variant="outlined">
                <v-card-title class="d-flex align-center justify-space-between">
                    <span>{{ localData.image ? 'Image actuelle' : 'Aucune image' }}</span>

                    <v-btn
                        v-if="!localData.image"
                        color="primary"
                        prepend-icon="mdi-upload"
                        variant="tonal"
                        :loading="uploading"
                        :disabled="uploading"
                        @click="triggerFileInput"
                    >
                        Ajouter
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleFileUpload"
                    />

                    <div v-if="localData.image" class="mb-4">
                        <v-card elevation="2">
                            <div class="image-wrapper">
                                <v-img
                                    :src="localData.image"
                                    max-height="300"
                                    cover
                                    class="image-preview"
                                ></v-img>

                                <div class="image-actions">
                                    <v-btn
                                        icon="mdi-refresh"
                                        size="small"
                                        variant="tonal"
                                        color="primary"
                                        title="Remplacer"
                                        @click="triggerFileInput"
                                    ></v-btn>

                                    <v-btn
                                        icon="mdi-delete"
                                        size="small"
                                        variant="tonal"
                                        color="error"
                                        title="Supprimer"
                                        @click="removeImage"
                                    ></v-btn>
                                </div>
                            </div>
                        </v-card>
                    </div>

                    <v-alert
                        v-else
                        type="info"
                        variant="tonal"
                        class="mt-4"
                    >
                        Aucune image. Uploadez une capture d'écran de votre SaaS.
                    </v-alert>

                    <v-progress-linear
                        v-if="uploading"
                        indeterminate
                        color="primary"
                        class="mt-4"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- CTA + Conditions -->
        <v-col md="6" class="mt-n4">
            <v-row>
                <!-- Call to Actions -->
                <v-col md="12">
                    <h3 class="text-h6 mb-4">Call to Actions (CTA)</h3>
                </v-col>

                <v-col md="12" class="mt-n8">
                    <v-text-field
                        v-model="localData.primaryButton.text"
                        label="Texte du bouton principal"
                        variant="outlined"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col md="8" class="mt-n8">
                    <v-text-field
                        v-model="localData.primaryButton.url"
                        label="URL du bouton principal"
                        placeholder="/register"
                        variant="outlined"
                        :disabled="!localData.primaryButton.text"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col md="4" class="mt-n8">
                    <v-select
                        v-model="localData.primaryButton.variant"
                        label="Style"
                        variant="outlined"
                        :items="buttonVariants"
                        @update:model-value="emitUpdate"
                    ></v-select>
                </v-col>

                <v-col md="12" class="mt-n8">
                    <v-text-field
                        v-model="localData.secondaryButton.text"
                        label="Texte du bouton secondaire"
                        variant="outlined"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col md="8" class="mt-n8">
                    <v-text-field
                        v-model="localData.secondaryButton.url"
                        label="URL du bouton secondaire"
                        placeholder="/demo"
                        variant="outlined"
                        :disabled="!localData.secondaryButton.text"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col md="4" class="mt-n8">
                    <v-select
                        v-model="localData.secondaryButton.variant"
                        label="Style"
                        variant="outlined"
                        :items="buttonVariants"
                        @update:model-value="emitUpdate"
                    ></v-select>
                </v-col>

                <!-- Conditions -->
                <v-col md="12" class="mt-n4">
                    <v-divider></v-divider>
                </v-col>

                <v-col md="12" class="mt-n4">
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div>
                            <h3 class="text-h6">Conditions</h3>
                            <p class="text-body-2 text-medium-emphasis mb-0">Badges de réassurance sous les CTA.</p>
                        </div>

                        <v-btn
                            color="primary"
                            prepend-icon="mdi-plus"
                            variant="tonal"
                            @click="addCondition"
                        >
                            Ajouter
                        </v-btn>
                    </div>

                    <v-alert
                        v-if="!localData.conditions || localData.conditions.length === 0"
                        type="info"
                        variant="tonal"
                    >
                        Aucune condition (ex : "Sans CB", "14 jours d'essai").
                    </v-alert>

                    <div
                        v-for="(condition, index) in localData.conditions"
                        :key="index"
                        class="d-flex align-center ga-3 mb-3"
                    >
                        <v-text-field
                            v-model="condition.text"
                            :label="`Condition ${index + 1}`"
                            placeholder="Sans CB"
                            variant="outlined"
                            density="compact"
                            hide-details
                            class="flex-grow-1"
                            @update:model-value="emitUpdate"
                        ></v-text-field>

                        <v-btn
                            icon="mdi-delete-outline"
                            size="small"
                            variant="tonal"
                            color="error"
                            @click="removeCondition(index)"
                        ></v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { SuperHeroData } from "~/models/Block";

const api = useApi();
const runtime = useRuntimeConfig();

interface Props {
    modelValue: SuperHeroData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: SuperHeroData];
}>();

const localData = ref<SuperHeroData>({
    ...JSON.parse(JSON.stringify(props.modelValue)),
});

const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

const buttonVariants = [
    { title: 'Plat', value: 'flat' },
    { title: 'Élevé', value: 'elevated' },
    { title: 'Tonalité', value: 'tonal' },
    { title: 'Contour', value: 'outlined' },
    { title: 'Texte', value: 'text' },
];

const triggerFileInput = () => {
    fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0 || !files[0]) {
        return;
    }

    uploading.value = true;

    try {
        const formData = new FormData();
        formData.append('files', files[0]);

        const response = await api.post<{ success: boolean; images: any[] }>(`/image/`, formData, {
            loadingKey: 'image:upload',
            toast: true
        });

        if (response.images && response.images.length > 0) {
            const img = response.images[0];
            localData.value.image = runtime.public.apiBase + img.url;
            emitUpdate();
        }
    } catch (error) {
        console.error('Erreur upload:', error);
    } finally {
        uploading.value = false;
        target.value = '';
    }
};

const removeImage = () => {
    localData.value.image = '';
    emitUpdate();
};

const addCondition = () => {
    if (!localData.value.conditions) {
        localData.value.conditions = [];
    }
    localData.value.conditions.push({ text: '' });
    emitUpdate();
};

const removeCondition = (index: number) => {
    localData.value.conditions.splice(index, 1);
    emitUpdate();
};

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

watch(() => props.modelValue, (newVal) => {
    localData.value = {
        ...JSON.parse(JSON.stringify(newVal)),
    };
}, { deep: true });
</script>

<style scoped>
.image-wrapper {
    position: relative;
    width: 100%;
}

.image-preview {
    width: 100%;
}

.image-actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
}

.image-wrapper:hover .image-actions {
    opacity: 1;
}
</style>
