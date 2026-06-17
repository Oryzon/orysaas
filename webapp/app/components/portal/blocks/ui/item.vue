<template>
    <v-card class="block-item mb-4" :class="{ 'block-item--hidden': !block.visible }">
        <v-card-title class="d-flex align-center pa-3 bg-grey-lighten-4">
            <v-icon class="drag-handle mr-3">
                mdi-drag-vertical
            </v-icon>

            <v-chip class="mr-3">
                {{ blockTypeLabel }}
            </v-chip>

            <v-spacer />

            <v-btn
                icon
                variant="text"
                color="primary"
                @click="$emit('toggle-visibility')"
            >
                <v-icon>
                    {{ block.visible ? 'mdi-eye' : 'mdi-eye-off' }}
                </v-icon>
            </v-btn>

            <v-btn
                icon
                variant="text"
                color="error"
                @click="$emit('delete')"
            >
                <v-icon>mdi-delete</v-icon>
            </v-btn>

            <v-btn
                icon
                variant="text"
                @click="expanded = !expanded"
            >
                <v-icon>
                    {{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
            </v-btn>
        </v-card-title>

        <v-expand-transition>
            <v-card-text v-show="expanded" class="pt-4">
                <component
                    :is="formComponent"
                    :model-value="block.data"
                    @update:model-value="$emit('update:data', $event)"
                ></component>
            </v-card-text>
        </v-expand-transition>
    </v-card>
</template>

<script setup lang="ts">
import type { Block } from "~/models/Block";

interface Props {
    block: Block;
}

const props = defineProps<Props>();

defineEmits<{
    'update:data': [value: Record<string, any>];
    'toggle-visibility': [];
    'delete': [];
}>();

const { getBlockType } = useCmsBlocks();

const expanded = ref(false);

const blockTypeLabel = computed(() => {
    return getBlockType(props.block.type)?.label || props.block.type;
});

import {
    PortalBlocksFormsCta,
    PortalBlocksFormsHero,
    PortalBlocksFormsOneColumns,
    PortalBlocksFormsTwoColumns,
    PortalBlocksFormsThreeColumns,
    PortalBlocksFormsGallery,
    PortalBlocksFormsSeparator,
    PortalBlocksFormsSuperHero,
    PortalBlocksFormsFaq,
    PortalBlocksFormsMultiCards
} from "#components";

const formComponent = computed(() => {
    const components: Record<string, any> = {
        'hero': PortalBlocksFormsHero,
        'super-hero': PortalBlocksFormsSuperHero,
        'one-columns': PortalBlocksFormsOneColumns,
        'two-columns': PortalBlocksFormsTwoColumns,
        'three-columns': PortalBlocksFormsThreeColumns,
        'gallery': PortalBlocksFormsGallery,
        'separator': PortalBlocksFormsSeparator,
        'cta': PortalBlocksFormsCta,
        'faq': PortalBlocksFormsFaq,
        'multi-cards': PortalBlocksFormsMultiCards
    };

    return components[props.block.type] || 'div';
});
</script>

<style scoped>
.block-item {
    transition: opacity 0.3s;
}

.block-item--hidden {
    opacity: 0.6;
}

.drag-handle {
    cursor: grab;
}

.drag-handle:active {
    cursor: grabbing;
}
</style>
