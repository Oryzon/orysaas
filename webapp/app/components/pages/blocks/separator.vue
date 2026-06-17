<template>
    <section
        class="block-separator"
        :class="[
            `spacing-${data.spacing || 'medium'}`,
            `width-${data.width || 'narrow'}`
        ]"
    >
        <v-container>
            <!-- Line -->
            <div
                v-if="data.style === 'line' || !data.style"
                class="separator-line"
                :class="`thickness-${data.thickness || 'thin'}`"
                :style="{ backgroundColor: getSeparatorColor }"
            ></div>

            <!-- Gradient -->
            <div
                v-else-if="data.style === 'gradient'"
                class="separator-gradient"
                :class="`thickness-${data.thickness || 'thin'}`"
            ></div>

            <!-- Dots -->
            <div
                v-else-if="data.style === 'dots'"
                class="separator-dots"
            >
                <span
                    v-for="i in 3"
                    :key="i"
                    class="dot"
                    :class="`thickness-${data.thickness || 'thin'}`"
                    :style="{ backgroundColor: getSeparatorColor }"
                ></span>
            </div>

            <!-- Wave -->
            <div
                v-else-if="data.style === 'wave'"
                class="separator-wave"
            >
                <svg
                    viewBox="0 0 1200 12"
                    preserveAspectRatio="none"
                    :class="`thickness-${data.thickness || 'thin'}`"
                >
                    <path
                        d="M0,6 Q300,0 600,6 T1200,6"
                        :stroke="getSeparatorColor"
                        fill="none"
                        stroke-linecap="round"
                    />
                </svg>
            </div>

            <!-- Ornament -->
            <div
                v-else-if="data.style === 'ornement'"
                class="separator-ornament"
            >
                <v-icon
                    :color="getSeparatorColor"
                    :size="getOrnamentSize"
                >
                    mdi-fleur-de-lis
                </v-icon>
            </div>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import type { SeparatorData } from '~/types/cms-blocks';

const props = defineProps<{
    data: SeparatorData;
}>();

const getSeparatorColor = computed(() => {
    if (!props.data.color) {
        return 'rgb(var(--v-theme-on-surface))';
    }

    // Si c'est une couleur Vuetify (primary, secondary, etc.)
    if (!props.data.color.startsWith('#') && !props.data.color.startsWith('rgb')) {
        return `rgb(var(--v-theme-${props.data.color}))`;
    }

    return props.data.color;
});

const getOrnamentSize = computed(() => {
    const sizes = {
        thin: 24,
        medium: 32,
        thick: 48,
    };
    return sizes[props.data.thickness || 'thin'];
});
</script>

<style scoped>
/* ===========================
   ESPACEMENT
   =========================== */
.block-separator {
    display: flex;
    align-items: center;
    justify-content: center;
}

.spacing-small {
    padding: 32px 0;
}

.spacing-medium {
    padding: 64px 0;
}

.spacing-large {
    padding: 96px 0;
}

/* ===========================
   LARGEUR
   =========================== */
.width-full .separator-line,
.width-full .separator-gradient,
.width-full .separator-wave svg {
    width: 100%;
}

.width-narrow .separator-line,
.width-narrow .separator-gradient,
.width-narrow .separator-wave svg {
    width: 60%;
    margin: 0 auto;
}

.width-ultranarrow .separator-line,
.width-ultranarrow .separator-gradient,
.width-ultranarrow .separator-wave svg {
    width: 30%;
    margin: 0 auto;
}

/* ===========================
   LINE
   =========================== */
.separator-line {
    border-radius: 999px;
    opacity: 0.2;
}

.separator-line.thickness-thin {
    height: 1px;
}

.separator-line.thickness-medium {
    height: 2px;
}

.separator-line.thickness-thick {
    height: 4px;
}

/* ===========================
   GRADIENT
   =========================== */
.separator-gradient {
    background: linear-gradient(
        to right,
        transparent,
        rgb(var(--v-theme-primary)),
        transparent
    );
    opacity: 0.3;
    border-radius: 999px;
}

/* ===========================
   DOTS
   =========================== */
.separator-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

.separator-dots .dot {
    border-radius: 50%;
    opacity: 0.4;
}

.separator-dots .dot.thickness-thin {
    width: 4px;
    height: 4px;
}

.separator-dots .dot.thickness-medium {
    width: 6px;
    height: 6px;
}

.separator-dots .dot.thickness-thick {
    width: 8px;
    height: 8px;
}

/* ===========================
   WAVE
   =========================== */
.separator-wave svg {
    display: block;
    opacity: 0.3;
}

.separator-wave svg.thickness-thin {
    height: 8px;
    stroke-width: 1;
}

.separator-wave svg.thickness-medium {
    height: 12px;
    stroke-width: 2;
}

.separator-wave svg.thickness-thick {
    height: 16px;
    stroke-width: 3;
}

/* ===========================
   ORNAMENT
   =========================== */
.separator-ornament {
    text-align: center;
    opacity: 0.3;
}

/* ===========================
   RESPONSIVE
   =========================== */
@media (max-width: 960px) {
    .spacing-small {
        padding: 24px 0;
    }

    .spacing-medium {
        padding: 48px 0;
    }

    .spacing-large {
        padding: 72px 0;
    }

    .width-narrow .separator-line,
    .width-narrow .separator-gradient,
    .width-narrow .separator-wave svg {
        width: 80%;
    }

    .width-ultranarrow .separator-line,
    .width-ultranarrow .separator-gradient,
    .width-ultranarrow .separator-wave svg {
        width: 50%;
    }
}
</style>
