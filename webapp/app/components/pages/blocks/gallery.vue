<template>
    <v-row justify="center" align="center" v-if="data.layout !== 'slider'" class="mt-4 mb-4">
        <v-col md="12" cols="12">
            <h1 v-if="data.title" class="text-center mb-8">
                {{ data.title }}
            </h1>
        </v-col>

        <v-col
            v-if="data.layout === 'grid'"
            v-for="(image, index) in data.images"
            :key="image.uuid"
            class="gallery-item"
            cols="11"
            :md="data.showRightColumn ? 5 : 3"
            @click="openLightbox(index)"
        >
            <v-card v-if="data.showRightColumn && (image.alt || image.caption || image.link)" class="card-image-wrapper" elevation="4">
                <v-toolbar color="#1cafaf" v-if="image.alt">
                    <v-toolbar-title>
                        {{ image.alt }}
                    </v-toolbar-title>
                </v-toolbar>

                <v-row no-gutters>
                    <v-col cols="12" md="6">
                        <div class="gallery-image-wrapper-right" @click="openLightbox(index)">
                            <v-img
                                :src="image.url"
                                :alt="image.alt || 'Image'"
                                aspect-ratio="1"
                                cover
                            >
                                <template v-slot:placeholder>
                                    <v-row
                                        align="center"
                                        class="fill-height ma-0"
                                        justify="center"
                                    >
                                        <v-progress-circular
                                            color="grey-lighten-5"
                                            indeterminate
                                        ></v-progress-circular>
                                    </v-row>
                                </template>
                            </v-img>
                        </div>
                    </v-col>

                    <v-card-text class="hidden-md-and-up ql-editor">
                        <div v-html="image.caption"></div>
                    </v-card-text>

                    <v-col md="6" class="hidden-sm-and-down mt-2 ql-editor">
                        <div v-html="image.caption"></div>
                    </v-col>
                </v-row>
            </v-card>

            <div v-else class="gallery-image-wrapper">
                <v-img
                    :src="image.url"
                    :alt="image.alt || 'Image'"
                    aspect-ratio="1"
                    class="gallery-image"
                    cover
                >
                    <template v-slot:placeholder>
                        <v-row
                            align="center"
                            class="fill-height ma-0"
                            justify="center"
                        >
                            <v-progress-circular
                                color="grey-lighten-5"
                                indeterminate
                            ></v-progress-circular>
                        </v-row>
                    </template>
                </v-img>

                <div v-if="image.caption" class="gallery-caption">
                    {{ image.caption }}
                </div>
            </div>
        </v-col>

        <v-col md="8" v-else-if="data.layout === 'masonry'">
            <div class="gallery-masonry">
                <div
                    v-for="(image, index) in data.images"
                    :key="image.uuid"
                    class="masonry-item"
                    @click="openLightbox(index)"
                >
                    <div class="masonry-image-wrapper">
                        <v-img
                            :src="image.url"
                            :alt="image.alt || 'Image'"
                            class="masonry-image"
                        >
                            <template #placeholder>
                                <div class="d-flex align-center justify-center fill-height">
                                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                </div>
                            </template>
                        </v-img>
                        <div v-if="image.caption" class="gallery-caption">
                            {{ image.caption }}
                        </div>
                    </div>
                </div>
            </div>
        </v-col>
    </v-row>

    <section v-if="data.layout === 'slider'" class="block-gallery gallery-slider mt-8 mb-12">
        <v-container>
            <h1 class="text-center mb-10">
                {{ data.title }}
            </h1>

            <!-- Slider -->
            <div v-if="data.layout === 'slider'" class="gallery-slider">
                <v-carousel
                    v-model="currentSlide"
                    height="600"
                    hide-delimiter-background
                    show-arrows="hover"
                    cycle
                    :interval="5000"
                >
                    <v-carousel-item
                        v-for="(image, index) in data.images"
                        :key="image.uuid"
                        @click="openLightbox(index)"
                    >
                        <div class="slider-item">
                            <v-img
                                :src="image.url"
                                :alt="image.alt || 'Image'"
                                height="100%"
                                cover
                                class="slider-image"
                            >
                                <template #placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular indeterminate color="white"></v-progress-circular>
                                    </div>
                                </template>
                            </v-img>

                            <div v-if="image.caption || image.alt" class="slider-caption">
                                <div class="slider-caption-content">
                                    <h3 v-if="image.alt" class="text-h5 mb-2">{{ image.alt }}</h3>

                                    <p v-if="image.caption" class="text-body-1">{{ image.caption }}</p>
                                </div>
                            </div>
                        </div>
                    </v-carousel-item>
                </v-carousel>
            </div>
        </v-container>

        <!-- Lightbox -->
    </section>

    <v-dialog
        v-if="data.isOpenable"
        v-model="lightboxOpen"
        max-width="95vw"
        scrim="black"
        @click:outside="closeLightbox"
    >
        <v-card class="lightbox-card" color="black">
            <v-card-text class="pa-0 position-relative">
                <div class="text-center mb-2 mt-2" v-if="lightboxImage">
                    <div v-if="lightboxImage.alt" class="text-h6 font-weight-bold white--text">
                        {{ lightboxImage.alt }}
                    </div>
                </div>

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
                    variant="tonal"
                    color="white"
                    class="lightbox-close"
                    @click="closeLightbox"
                ></v-btn>

                <v-btn
                    v-if="lightboxIndex > 0"
                    icon="mdi-chevron-left"
                    size="large"
                    variant="tonal"
                    color="white"
                    class="lightbox-nav lightbox-nav-left"
                    @click.stop="previousImage"
                ></v-btn>

                <v-btn
                    v-if="lightboxIndex < (data.images?.length || 0) - 1"
                    icon="mdi-chevron-right"
                    size="large"
                    variant="tonal"
                    color="white"
                    class="lightbox-nav lightbox-nav-right"
                    @click.stop="nextImage"
                ></v-btn>

                <div class="text-center mb-2">
                    <div class="text-caption text-grey mt-2">
                        Image {{ lightboxIndex + 1 }} / {{ data.images?.length }}
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import type { GalleryData } from "~/models/Block";

interface Props {
    data: GalleryData;
}

const props = defineProps<Props>();

// Slider
const currentSlide = ref(0);

// Lightbox
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const lightboxImage = computed(() => {
    if (props.data.images && lightboxIndex.value >= 0) {
        return props.data.images[lightboxIndex.value];
    }

    return null;
});

const openLightbox = (index: number) => {
    if (props.data.isOpenable) {
        lightboxIndex.value = index;
        lightboxOpen.value = true;
    }
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
    if (props.data.images && lightboxIndex.value < props.data.images.length - 1) {
        lightboxIndex.value++;
    }
};
</script>

<style scoped>
.block-gallery {
    padding: 50px 0;
}

.gallery-item {
    cursor: pointer;
    transition: transform 0.3s ease;
}

.gallery-item:hover {
    transform: translateY(-8px);
}

.gallery-image-wrapper {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
}

.card-image-wrapper {
    border-radius: 12px;
}

.gallery-image-wrapper-right {
    border-radius: 12px 12px 0px 0px;
}

.gallery-item:hover .gallery-image-wrapper {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.gallery-image {
    transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image {
    transform: scale(1.05);
}

.gallery-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    color: white;
    padding: 16px;
    font-size: 14px;
    line-height: 1.4;
}

/* MASONRY */
.gallery-masonry {
    columns: 3;
    column-gap: 24px;
}

@media (max-width: 960px) {
    .gallery-masonry {
        columns: 2;
    }
}

@media (max-width: 600px) {
    .gallery-masonry {
        columns: 1;
    }
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 24px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.masonry-item:hover {
    transform: translateY(-4px);
}

.masonry-image-wrapper {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
}

.masonry-item:hover .masonry-image-wrapper {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.masonry-image {
    transition: transform 0.3s ease;
    width: 100%;
    display: block;
}

.masonry-item:hover .masonry-image {
    transform: scale(1.03);
}

/* SLIDER */
.gallery-slider {
    border-radius: 24px;
    overflow: hidden;
    background: #e0e5ec;
    box-shadow:
        20px 20px 60px #bebebe,
        -20px -20px 60px #ffffff;
    position: relative;
}

.slider-item {
    position: relative;
    width: 100%;
    height: 100%;
}

.slider-image {
    cursor: pointer;
}

.slider-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
    padding: 48px 32px 32px;
}

.slider-caption-content {
    color: white;
    max-width: 800px;
    margin: 0 auto;
}

.slider-caption-content h3 {
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.slider-caption-content p {
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.lightbox-card {
    background: #000;
}

.lightbox-image {
    background: #000;
    cursor: zoom-out;
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

@media (max-width: 960px) {
    .block-gallery {
        padding: 60px 0;
    }

    .gallery-slider {
        border-radius: 12px;
    }

    :deep(.v-carousel) {
        height: 400px !important;
    }
}

@media (max-width: 600px) {
    .block-gallery {
        padding: 40px 0;
    }

    :deep(.v-carousel) {
        height: 300px !important;
    }

    .slider-caption {
        padding: 32px 16px 16px;
    }

    .slider-caption-content h3 {
        font-size: 1.25rem;
    }

    .slider-caption-content p {
        font-size: 0.875rem;
    }
}
</style>