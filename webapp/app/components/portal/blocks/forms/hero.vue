<template>
    <v-row>
        <v-col md="12">
            <v-text-field
                v-model="localData.title"
                label="Titre principal"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="12" class="mt-n8">
            <v-textarea
                v-model="localData.subtitle"
                label="Sous-titre (optionnel)"
                variant="outlined"
                rows="3"
                @update:model-value="emitUpdate"
            ></v-textarea>
        </v-col>

        <v-col md="12" class="mt-n8">
            <v-divider></v-divider>
        </v-col>

        <v-col md="12" class="mt-n4">
            <h3 class="text-h6 mb-4">Image de fond</h3>
        </v-col>

        <v-col md="12" class="mt-n8">
            <v-card variant="outlined">
                <v-card-title class="d-flex align-center justify-space-between">
                    <span>{{ localData.backgroundImage ? 'Image actuelle' : 'Aucune image' }}</span>

                    <v-btn
                        v-if="!localData.backgroundImage"
                        color="primary"
                        prepend-icon="mdi-upload"
                        @click="triggerFileInput"
                        :loading="uploading"
                        :disabled="uploading"
                        variant="tonal"
                    >
                        Ajouter une image
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

                    <!-- Prévisualisation de l'image -->
                    <div v-if="localData.backgroundImage" class="mb-4">
                        <v-card elevation="2">
                            <div class="image-wrapper">
                                <v-img
                                    :src="localData.backgroundImage"
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
                                        @click="triggerFileInput"
                                        title="Remplacer"
                                    ></v-btn>

                                    <v-btn
                                        icon="mdi-delete"
                                        size="small"
                                        variant="tonal"
                                        color="error"
                                        @click="removeImage"
                                        title="Supprimer"
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
                        Aucune image de fond. Cliquez sur "Ajouter une image" pour en uploader une.
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

        <v-col md="6" class="mt-n2" v-if="localData.backgroundImage">
            <v-select
                v-model="localData.backgroundPosition"
                label="Position de l'image"
                variant="outlined"
                :items="backgroundPositions"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>

        <v-col md="6" class="mt-n2" v-if="localData.backgroundImage">
            <v-select
                v-model="localData.backgroundSize"
                label="Taille de l'image"
                variant="outlined"
                :items="backgroundSizes"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>

        <v-col md="12" class="mt-n4">
            <v-divider></v-divider>
        </v-col>

        <v-col md="12" class="mt-n4">
            <h3 class="text-h6 mb-4">Call to Action (CTA)</h3>
        </v-col>

        <v-col md="4" class="mt-n8">
            <v-text-field
                v-model="localData.cta.text"
                label="Texte du bouton"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="4" class="mt-n8">
            <v-text-field
                v-model="localData.cta.url"
                label="URL du bouton"
                variant="outlined"
                placeholder="/contact"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="4" class="mt-n8">
            <v-select
                v-model="localData.cta.variant"
                label="Style du bouton"
                variant="outlined"
                :items="buttonVariants"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { HeroData } from "~/models/Block";

const api = useApi();
const runtime = useRuntimeConfig();

interface Props {
    modelValue: HeroData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: HeroData];
}>();

// État local
const localData = ref<HeroData>({
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

const backgroundPositions = [
    { title: 'Centré', value: 'center' },
    { title: 'Haut', value: 'top' },
    { title: 'Bas', value: 'bottom' },
    { title: 'Gauche', value: 'left' },
    { title: 'Droite', value: 'right' },
    { title: 'Haut gauche', value: 'top left' },
    { title: 'Haut droite', value: 'top right' },
    { title: 'Bas gauche', value: 'bottom left' },
    { title: 'Bas droite', value: 'bottom right' },
];

const backgroundSizes = [
    { title: 'Couvrir (recommandé)', value: 'cover' },
    { title: 'Contenir', value: 'contain' },
    { title: 'Étirer', value: '100% 100%' },
    { title: 'Auto', value: 'auto' },
];

const triggerFileInput = () => {
    fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) {
        return;
    }

    uploading.value = true;

    try {
        const formData = new FormData();
        formData.append('files', files[0]); // Une seule image pour le hero

        const response = await api.post<{ success: boolean; images: any[] }>(`/image/`, formData, {
            loadingKey: 'image:upload',
            toast: true
        });

        if (response.images && response.images.length > 0) {
            const img = response.images[0];
            localData.value.backgroundImage = runtime.public.apiBase + img.url;
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
    localData.value.backgroundImage = '';
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
