<template>
    <section
        class="hero-section mb-6"
        :style="heroStyles"
    >
        <div class="hero-blob" :style="blobStyle"></div>
        <v-container class="hero-content">
            <v-row justify="center">
                <v-col cols="12" md="10" class="text-center">
                    <h1 v-if="data.title" class="text-display-large font-weight-black mb-6">
                        {{ data.title }}
                    </h1>

                    <h2
                        v-if="data.subtitle"
                        class="text-headline-small text-medium-emphasis font-weight-regular mb-6"
                    >
                        {{ data.subtitle }}
                    </h2>

                    <v-btn
                        v-if="data.cta?.text"
                        :to="data.cta.url"
                        :variant="data.cta.variant || 'flat'"
                        color="#1cafaf"
                        size="x-large"
                        class="mt-4"
                        rounded="xl"
                    >
                        {{ data.cta.text }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import type { HeroData } from '~/models/Block';

const props = defineProps<{
    data: HeroData;
    blockId?: string;
}>();

const BLOB_POSITIONS = [
    { top: '-80px',  right: '-100px', bottom: 'auto', left: 'auto'  },
    { top: '-80px',  left:  '-100px', bottom: 'auto', right: 'auto' },
    { bottom: '-80px', right: '-100px', top: 'auto', left: 'auto'   },
    { bottom: '-80px', left:  '-100px', top: 'auto', right: 'auto'  },
    { top: '50%',    right: '-120px', bottom: 'auto', left: 'auto'  },
    { top: '50%',    left:  '-120px', bottom: 'auto', right: 'auto' },
];

const blobStyle = computed(() => {
    const id = props.blockId ?? '';
    const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    return BLOB_POSITIONS[hash % BLOB_POSITIONS.length];
});

const heroStyles = computed(() => {
    const styles: any = {
        minHeight: '35vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'clip',
    };

    if (props.data.backgroundImage) {
        styles.backgroundImage = `url(${props.data.backgroundImage})`;
        styles.backgroundPosition = props.data.backgroundPosition || 'center';
        styles.backgroundSize = props.data.backgroundSize || 'cover';
        styles.backgroundRepeat = 'no-repeat';
    }

    return styles;
});
</script>

<style scoped>
.hero-blob {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 40%, transparent), transparent 65%);
    filter: blur(28px);
    pointer-events: none;
}
</style>