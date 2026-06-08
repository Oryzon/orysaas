<template>
    <section class="super-hero-section">
        <div class="blob blob--top"></div>
        <div class="blob blob--bottom"></div>

        <v-container class="super-hero-content">
            <v-row v-if="hasLastChanges" justify="center" class="mb-6">
                <v-col cols="auto">
                    <v-chip
                        :to="buildTo(data.lastChanges.url)"
                        :href="isExternal(data.lastChanges.url) ? data.lastChanges.url : undefined"
                        color="primary"
                        variant="outlined"
                        rounded="xl"
                        size="large"
                    >
                        <v-chip
                            v-if="data.lastChanges.versionNo"
                            class="mr-2 font-weight-bold"
                            variant="flat"
                            color="primary"
                        >
                            v{{ data.lastChanges.versionNo }}
                        </v-chip>

                        {{ data.lastChanges.title }}

                        <v-icon v-if="data.lastChanges.url" end size="16">mdi-arrow-right</v-icon>
                    </v-chip>
                </v-col>
            </v-row>

            <v-row justify="center" class="mb-4">
                <v-col cols="12" md="9" class="text-center">
                    <h1 class="text-display-large font-weight-bold">{{ data.title }}</h1>
                </v-col>
            </v-row>

            <v-row v-if="data.subtitle" justify="center" class="mb-8">
                <v-col cols="12" md="7" class="text-center">
                    <p class="text-headline-small text-medium-emphasis font-weight-regular ma-0">{{ data.subtitle }}</p>
                </v-col>
            </v-row>

            <v-row justify="center" class="mb-4">
                <v-col cols="auto">
                    <div class="d-flex flex-wrap justify-center ga-3">
                        <v-btn
                            v-if="data.primaryButton?.text"
                            :to="buildTo(data.primaryButton.url)"
                            :href="isExternal(data.primaryButton.url) ? data.primaryButton.url : undefined"
                            :variant="data.primaryButton.variant || 'flat'"
                            color="primary"
                            size="large"
                            rounded="lg"
                        >
                            {{ data.primaryButton.text }}
                        </v-btn>

                        <v-btn
                            v-if="data.secondaryButton?.text"
                            :to="buildTo(data.secondaryButton.url)"
                            :href="isExternal(data.secondaryButton.url) ? data.secondaryButton.url : undefined"
                            :variant="data.secondaryButton.variant || 'tonal'"
                            color="primary"
                            size="large"
                            rounded="lg"
                        >
                            {{ data.secondaryButton.text }}
                        </v-btn>
                    </div>
                </v-col>
            </v-row>

            <v-row v-if="data.conditions?.length" justify="center" class="mb-10">
                <v-col cols="auto">
                    <div class="d-flex flex-wrap justify-center align-center ga-3">
                        <template v-for="(condition, index) in data.conditions" :key="index">
                            <div class="d-flex align-center ga-1 text-medium-emphasis text-body-2">
                                <v-icon size="16" color="success">mdi-check-circle-outline</v-icon>
                                {{ condition.text }}
                            </div>
                        </template>
                    </div>
                </v-col>
            </v-row>

            <v-row v-if="data.image" justify="center">
                <v-col cols="12" md="11" lg="10">
                    <div class="mac-window-wrapper">
                        <div class="mac-halo"></div>

                        <div class="mac-window">
                            <div class="mac-titlebar">
                                <span class="mac-dot mac-dot--red"></span>
                                <span class="mac-dot mac-dot--yellow"></span>
                                <span class="mac-dot mac-dot--green"></span>
                            </div>

                            <img :src="data.image" class="mac-screenshot" alt="Aperçu du produit" />
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import type { SuperHeroData } from '~/models/Block';

const props = defineProps<{
    data: SuperHeroData;
}>();

const hasLastChanges = computed(
    () => props.data.lastChanges?.title || props.data.lastChanges?.versionNo,
);

const isExternal = (url: string | undefined) =>
    !!url && (url.startsWith('http://') || url.startsWith('https://'));

const buildTo = (url: string | undefined) => {
    if (!url || isExternal(url)) {
        return undefined;
    }
    return url.startsWith('/') ? url : `/${url}`;
};
</script>

<style scoped>
.super-hero-section {
    position: relative;
    overflow: hidden;
    padding: 80px 0 0;
}

.super-hero-content {
    position: relative;
    z-index: 1;
}

/* Blobs */
.blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
}

.blob--top {
    top: 10%;
    left: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 38%, transparent), transparent 65%);
    filter: blur(32px);
}

.blob--bottom {
    top: 30%;
    right: -120px;
    width: 460px;
    height: 460px;
    background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 45%, transparent), transparent 65%);
    filter: blur(32px);
}

/* Fenêtre macOS */
.mac-window-wrapper {
    position: relative;
}

.mac-halo {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    height: 120px;
    background: radial-gradient(ellipse at center top, rgba(var(--v-theme-primary), 0.35) 0%, transparent 70%);
    filter: blur(24px);
    pointer-events: none;
    z-index: 0;
}

.mac-window {
    position: relative;
    z-index: 1;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.08),
        0 8px 24px rgba(0, 0, 0, 0.12),
        0 32px 64px rgba(0, 0, 0, 0.16);
}

.mac-titlebar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #1e1e2e;
}

.mac-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.mac-dot--red    { background: #ff5f57; }
.mac-dot--yellow { background: #febc2e; }
.mac-dot--green  { background: #28c840; }

.mac-screenshot {
    display: block;
    width: 100%;
    height: auto;
    max-width: 100%;
    vertical-align: bottom;
    border-radius: 0 !important;
}
</style>