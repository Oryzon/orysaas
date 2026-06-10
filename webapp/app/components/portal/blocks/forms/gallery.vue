<template>
    <v-row>
        <v-col md="8">
            <v-text-field
                v-model="localData.title"
                label="Titre (optionnel)"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="4">
            <v-select
                v-model="localData.layout"
                :items="layoutOptions"
                label="Style"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>

        <v-col md="4" class="mt-n10">
            <v-switch
                label="Permettre ouverture image ?"
                color="success"
                v-model="localData.isOpenable"
                @update:model-value="emitUpdate"
                inset
            ></v-switch>
        </v-col>

        <v-col md="4" class="mt-n10" v-if="localData.layout === 'grid'">
            <v-switch
                label="Afficher le contenu a droite ?"
                color="success"
                v-model="localData.showRightColumn"
                @update:model-value="emitUpdate"
                inset
            ></v-switch>
        </v-col>

        <v-col md="12" class="mt-n8">
            <v-card variant="outlined">
                <v-card-title class="d-flex align-center justify-space-between">
                    <span>Images ({{ localData.images?.length || 0 }})</span>

                    <v-btn
                        color="primary"
                        prepend-icon="mdi-upload"
                        @click="triggerFileInput"
                        :loading="uploading"
                        :disabled="uploading"
                        variant="tonal"
                    >
                        Ajouter des images
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        multiple
                        style="display: none"
                        @change="handleFileUpload"
                    />

                    <div v-if="localData.images && localData.images.length > 0" class="images-grid">
                        <draggable
                            v-model="localData.images"
                            item-key="uuid"
                            @end="emitUpdate"
                            class="d-flex flex-wrap ga-3"
                        >
                            <template #item="{ element, index }">
                                <div class="image-item">
                                    <v-card
                                        class="image-card"
                                        elevation="2"
                                        @click="openLightbox(index)"
                                    >
                                        <div class="image-wrapper">
                                            <v-img
                                                :src="element.url"
                                                :alt="element.alt || 'Image'"
                                                aspect-ratio="1"
                                                cover
                                                class="image-preview"
                                            />

                                            <div class="image-actions">
                                                <v-btn
                                                    icon="mdi-pencil"
                                                    size="small"
                                                    variant="tonal"
                                                    color="primary"
                                                    @click.stop="editImage(index)"
                                                    title="Modifier"
                                                ></v-btn>

                                                <v-btn
                                                    icon="mdi-delete"
                                                    size="small"
                                                    variant="tonal"
                                                    color="error"
                                                    @click.stop="removeImage(index)"
                                                    title="Supprimer"
                                                ></v-btn>
                                            </div>
                                        </div>

                                        <div class="image-info pa-2">
                                            <div class="text-caption text-truncate" :title="element.alt || element.originalName">
                                                {{ element.alt || element.originalName || 'Sans nom' }}
                                            </div>
                                        </div>
                                    </v-card>
                                </div>
                            </template>
                        </draggable>
                    </div>

                    <v-alert
                        v-else
                        type="info"
                        variant="tonal"
                        class="mt-4"
                    >
                        Il n'y a pas d'image.
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
    </v-row>

    <v-dialog
        v-model="lightboxOpen"
        max-width="90vw"
        @click:outside="closeLightbox"
    >
        <v-card class="lightbox-card">
            <v-card-text class="pa-0 position-relative">
                <v-img
                    v-if="lightboxImage"
                    :src="lightboxImage.url"
                    :alt="lightboxImage.alt"
                    contain
                    max-height="85vh"
                    class="lightbox-image"
                ></v-img>

                <v-btn
                    icon="mdi-close"
                    size="large"
                    color="white"
                    class="lightbox-close"
                    @click="closeLightbox"
                ></v-btn>

                <v-btn
                    v-if="lightboxIndex > 0"
                    icon="mdi-chevron-left"
                    size="large"
                    color="white"
                    class="lightbox-nav lightbox-nav-left"
                    @click.stop="previousImage"
                ></v-btn>

                <v-btn
                    v-if="lightboxIndex < (localData.images?.length || 0) - 1"
                    icon="mdi-chevron-right"
                    size="large"
                    color="white"
                    class="lightbox-nav lightbox-nav-right"
                    @click.stop="nextImage"
                ></v-btn>
            </v-card-text>


            <v-card-text v-if="lightboxImage" class="text-center">
                <div class="text-subtitle-1 font-weight-bold">
                    {{ lightboxImage.alt || lightboxImage.originalName }}
                </div>

                <div v-if="lightboxImage.caption" class="text-caption text-grey">
                    {{ lightboxImage.caption }}
                </div>

                <div class="text-caption text-grey mt-1">
                    Image {{ lightboxIndex + 1 }} / {{ localData.images?.length }}
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" :max-width="localData.showRightColumn ? 1200 : 600">
        <v-card v-if="editingImage">
            <v-toolbar>
                <v-toolbar-title>Modifier</v-toolbar-title>

                <v-toolbar-items>
                    <v-btn color="error" @click="cancelEdit">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text>
                <v-row>
                    <v-col md="12">
                        <v-img
                            :src="editingImage.url"
                            :alt="editingImage.alt"
                            class="rounded"
                            max-height="300"
                            contain
                        ></v-img>
                    </v-col>

                    <v-col md="12" class="mt-n2">
                        <v-text-field
                            v-model="editingImage.alt"
                            label="Texte alternatif (SEO)"
                            variant="outlined"
                        ></v-text-field>
                    </v-col>

                    <v-col md="12" class="mt-n8 mb-16" style="height: 500px; margin-bottom: 90px;" v-if="localData.showRightColumn">
                        <client-only>
                            <quill-editor
                                toolbar="full"
                                contentType="html"
                                v-model:content="editingImage.caption"
                            ></quill-editor>
                        </client-only>
                    </v-col>

                    <v-col md="12" class="mt-n8" v-else>
                        <v-textarea
                            v-model="editingImage.caption"
                            label="Légende"
                            variant="outlined"
                            rows="3"
                        ></v-textarea>
                    </v-col>

                    <v-col md="12" class="mt-n8">
                        <v-text-field
                            v-model="editingImage.link"
                            label="Lien"
                            variant="outlined"
                        ></v-text-field>
                    </v-col>

                    <v-col md="12" class="mt-n12">
                        <v-switch
                            v-model="editingImage.linkTarget"
                            label="Ouvrir dans un nouvel onglet ?"
                            color="success"
                            inset
                        ></v-switch>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions class="bg-surface-light mt-n10">
                <v-spacer></v-spacer>

                <v-btn color="success" @click="saveEdit" variant="tonal">
                    Modifier
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import type { GalleryData, GalleryImage } from "~/models/Block";

const api = useApi();
const runtime = useRuntimeConfig();

interface Props {
    modelValue: GalleryData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: GalleryData];
}>();

const layoutOptions = [
    { title: 'Grille', value: 'grid' },
    { title: 'Masonry', value: 'masonry' },
    { title: 'Slider', value: 'slider' }
];

const localData = ref<GalleryData>(JSON.parse(JSON.stringify(props.modelValue)));

const fileInput = ref<HTMLInputElement | null>(null);
const editDialog = ref(false);
const editingImage = ref<GalleryImage | null>(null);
const editingIndex = ref<number>(-1);
const uploading = ref(false);

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

const lightboxImage = computed(() => {
    if (localData.value.images && lightboxIndex.value >= 0) {
        return localData.value.images[lightboxIndex.value];
    }

    return null;
});

const openLightbox = (index: number) => {
    lightboxIndex.value = index;
    lightboxOpen.value = true;
};

const closeLightbox = () => {
    lightboxOpen.value = false;
};

const previousImage = () => {
    if (lightboxIndex.value > 0) {
        lightboxIndex.value--;
    }
};

const nextImage = () => {
    if (localData.value.images && lightboxIndex.value < localData.value.images.length - 1) {
        lightboxIndex.value++;
    }
};

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

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const response = await api.post<{ success: boolean; images: any[] }>(`/image/`, formData, {
            loadingKey: 'image:upload',
            toast: true
        });

        if (!localData.value.images) {
            localData.value.images = [];
        }

        response.images.forEach((img: any) => {
            localData.value.images!.push({
                uuid: img.uuid,
                url: runtime.public.apiBase + img.url,
                alt: img.originalName.replace(/\.[^/.]+$/, ''),
                caption: '',
                originalName: img.originalName
            });
        });

        emitUpdate();
    } catch (error) {
        console.error('Erreur upload:', error);
    } finally {
        uploading.value = false;
        target.value = '';
    }
};

const removeImage = (index: number) => {
    // @ToDo : add a nice dialog
    localData.value.images?.splice(index, 1);

    emitUpdate();
};

const editImage = (index: number) => {
    editingIndex.value = index;
    editingImage.value = JSON.parse(JSON.stringify(localData.value.images![index]));

    editDialog.value = true;
};

const saveEdit = () => {
    if (editingImage.value && editingIndex.value !== -1 && localData.value.images) {
        localData.value.images[editingIndex.value] = JSON.parse(JSON.stringify(editingImage.value));
        emitUpdate();
    }

    editDialog.value = false;
    editingImage.value = null;
    editingIndex.value = -1;
};

const cancelEdit = () => {
    editDialog.value = false;
    editingImage.value = null;
    editingIndex.value = -1;
};

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

watch(() => props.modelValue, (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });
</script>

<style scoped>
.images-grid {
    width: 100%;
}

.image-item {
    width: 180px;
    flex-shrink: 0;
}

.image-card {
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: all 0.2s;
}

.image-wrapper {
    position: relative;
    width: 100%;
    height: 180px;
}

.image-preview {
    width: 100%;
    height: 100%;
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

.image-card:hover .image-actions {
    opacity: 1;
}

.image-info {
    background: rgba(0, 0, 0, 0.03);
    min-height: 32px;
}

.image-item:hover .image-card {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}

.lightbox-card {
    background: #000;
}

.lightbox-image {
    background: #000;
}

.lightbox-close {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
}

.lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
}

.lightbox-nav-left {
    left: 16px;
}

.lightbox-nav-right {
    right: 16px;
}
</style>
