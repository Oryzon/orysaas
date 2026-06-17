<!-- components/blocks/ui/cta.vue -->
<template>
    <section :class="['cta-block', `cta-bg-${data.background}`, `cta-layout-${data.layout}`]">
        <v-container :class="{ 'container-fluid': data.layout === 'banner' }">
            <div class="cta-wrapper">
                <div v-if="data.layout === 'centered'" class="cta-centered">
                    <div v-if="data.preTitle" class="cta-pretitle">
                        {{ data.preTitle }}
                    </div>

                    <h2 class="cta-title">
                        {{ data.title }}
                    </h2>

                    <p v-if="data.subtitle" class="cta-subtitle">
                        {{ data.subtitle }}
                    </p>

                    <div v-if="data.description" class="cta-description">
                        <div v-html="data.description"></div>
                    </div>

                    <div class="cta-buttons">
                        <v-btn
                            v-if="data.primaryButton.text"
                            variant="elevated"
                            color="white"
                            size="large"
                            :href="data.primaryButton.url"
                            class="cta-button"
                        >
                            {{ data.primaryButton.text }}
                        </v-btn>

                        <v-btn
                            v-if="data.secondaryButton.text"
                            variant="outlined"
                            color="white"
                            size="large"
                            :href="data.secondaryButton.url"
                            class="cta-button"
                        >
                            {{ data.secondaryButton.text }}
                        </v-btn>
                    </div>
                </div>

                <div v-else-if="data.layout === 'split'" class="cta-split">
                    <div class="cta-split-left">
                        <div v-if="data.preTitle" class="cta-pretitle">
                            {{ data.preTitle }}
                        </div>

                        <h2 class="cta-title">{{ data.title }}</h2>

                        <p v-if="data.subtitle" class="cta-subtitle">
                            {{ data.subtitle }}
                        </p>

                        <div v-if="data.description" class="cta-description">
                            <div v-html="data.description"></div>
                        </div>
                    </div>

                    <div class="cta-split-right">
                        <div class="cta-buttons">
                            <v-btn
                                v-if="data.primaryButton.text"
                                variant="elevated"
                                color="white"
                                size="large"
                                :href="data.primaryButton.url"
                                class="cta-button"
                                block
                            >
                                {{ data.primaryButton.text }}
                            </v-btn>

                            <v-btn
                                v-if="data.secondaryButton.text"
                                variant="outlined"
                                color="white"
                                size="large"
                                :href="data.secondaryButton.url"
                                class="cta-button"
                                block
                            >
                                {{ data.secondaryButton.text }}
                            </v-btn>
                        </div>
                    </div>
                </div>

                <div v-else-if="data.layout === 'banner'" class="cta-banner">
                    <div class="cta-banner-content">
                        <div class="cta-banner-text">
                            <div v-if="data.preTitle" class="cta-pretitle">
                                {{ data.preTitle }}
                            </div>

                            <h2 class="cta-title">{{ data.title }}</h2>

                            <p v-if="data.subtitle" class="cta-subtitle">
                                {{ data.subtitle }}
                            </p>
                        </div>

                        <div class="cta-banner-buttons">
                            <v-btn
                                v-if="data.primaryButton.text"
                                variant="elevated"
                                color="white"
                                size="large"
                                :href="data.primaryButton.url"
                                class="cta-button"
                            >
                                {{ data.primaryButton.text }}
                            </v-btn>

                            <v-btn
                                v-if="data.secondaryButton.text"
                                variant="outlined"
                                color="white"
                                size="large"
                                :href="data.secondaryButton.url"
                                class="cta-button"
                            >
                                {{ data.secondaryButton.text }}
                            </v-btn>
                        </div>
                    </div>
                </div>

                <div v-else-if="data.layout === 'card'" class="cta-card">
                    <v-card class="cta-card-inner" elevation="8">
                        <v-card-text class="pa-8">
                            <div v-if="data.preTitle" class="cta-pretitle">
                                {{ data.preTitle }}
                            </div>

                            <h2 class="cta-title">{{ data.title }}</h2>

                            <p v-if="data.subtitle" class="cta-subtitle">
                                {{ data.subtitle }}
                            </p>

                            <div v-if="data.description" class="cta-description">
                                <div v-html="data.description"></div>
                            </div>

                            <div class="cta-buttons">
                                <v-btn
                                    v-if="data.primaryButton.text"
                                    variant="elevated"
                                    :color="data.background === 'primary' ? 'primary' : 'secondary'"
                                    size="large"
                                    :href="data.primaryButton.url"
                                    class="cta-button"
                                >
                                    {{ data.primaryButton.text }}
                                </v-btn>

                                <v-btn
                                    v-if="data.secondaryButton.text"
                                    variant="outlined"
                                    :color="data.background === 'primary' ? 'primary' : 'secondary'"
                                    size="large"
                                    :href="data.secondaryButton.url"
                                    class="cta-button"
                                >
                                    {{ data.secondaryButton.text }}
                                </v-btn>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>
            </div>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import type { CtaBlockData } from "~/models/Block";

defineProps<{
    data: CtaBlockData;
    blockId?: string;
}>();
</script>

<style scoped>
.cta-block {
    color: white;
}

.cta-layout-centered,
.cta-layout-split,
.cta-layout-card {
    padding: 40px 0;
}

.cta-layout-banner {
    padding: 40px 0;
}

.cta-pretitle {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
    margin-bottom: 16px;
    opacity: 0.9;
}

.cta-title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 16px;
}

.cta-subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 400;
    margin-bottom: 24px;
    opacity: 0.95;
}

.cta-description {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 32px;
    opacity: 0.9;
}

.cta-description :deep(p) {
    margin-bottom: 0.75em;
}

.cta-description :deep(p:last-child) {
    margin-bottom: 0;
}

.cta-buttons {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.cta-button {
    min-width: 160px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
}

.cta-centered {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.cta-centered .cta-buttons {
    justify-content: center;
}

.cta-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
}

.cta-split-left {
    text-align: left;
}

.cta-split-right .cta-buttons {
    flex-direction: column;
    align-items: stretch;
}

.cta-banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
}

.cta-banner-text {
    flex: 1;
}

.cta-banner-text .cta-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin-bottom: 8px;
}

.cta-banner-text .cta-subtitle {
    font-size: 1rem;
    margin-bottom: 0;
}

.cta-banner-buttons {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
}

.cta-card {
    max-width: 900px;
    margin: 0 auto;
}

.cta-card .cta-pretitle {
    color: #118992;
    opacity: 1;
}

.cta-card .cta-buttons {
    justify-content: center;
}

.cta-bg-primary {
    background: linear-gradient(135deg, #118992 0%, #1BD7E4 100%);
}

.cta-bg-secondary {
    background: linear-gradient(135deg, #108288 0%, #0C6469 100%);
}

.cta-bg-gradient {
    background: linear-gradient(135deg, #118992 0%, #108288 100%);
}

.cta-layout-card.cta-bg-primary,
.cta-layout-card.cta-bg-secondary,
.cta-layout-card.cta-bg-gradient {
    background: transparent;
}

.cta-card .cta-button.v-btn--variant-elevated {
    background-color: #118992 !important;
    color: white !important;
}

.cta-card .cta-button.v-btn--variant-outlined {
    border-color: #118992 !important;
    color: #118992 !important;
}

@media (max-width: 960px) {
    .cta-split {
        grid-template-columns: 1fr;
        gap: 32px;
    }

    .cta-split-left {
        text-align: center;
    }

    .cta-split-right .cta-buttons {
        flex-direction: row;
        justify-content: center;
    }
}

@media (max-width: 600px) {
    .cta-layout-centered,
    .cta-layout-split,
    .cta-layout-card {
        padding: 48px 0;
    }

    .cta-layout-banner {
        padding: 24px 0;
    }

    .cta-banner-content {
        flex-direction: column;
        text-align: center;
    }

    .cta-banner-buttons {
        flex-direction: column;
        width: 100%;
    }

    .cta-banner-buttons .cta-button {
        width: 100%;
    }

    .cta-buttons {
        flex-direction: column;
        width: 100%;
    }

    .cta-button {
        width: 100%;
    }
}
</style>

