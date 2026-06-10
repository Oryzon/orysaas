<template>
    <component
        :is="getBlockComponent(block.type)"
        v-if="block.visible"
        :data="block.data"
        :block-id="block.uuid"
    />
</template>

<script setup lang="ts">
import type { Block } from "~/models/Block";

const props = defineProps<{
    block: Block
}>();

import { PagesBlocksHero } from "#components";
import { PagesBlocksSuperHero } from "#components";
import { PagesBlocksOneColumns } from "#components";
import { PagesBlocksTwoColumns } from "#components";
import { PagesBlocksThreeColumns } from "#components";
import { PagesBlocksGallery } from "#components";
import { PagesBlocksSeparator } from "#components";
import { PagesBlocksCta } from "#components";
import { PagesBlocksFaq } from "#components";
import { PagesBlocksMultiCards } from "#components";

const getBlockComponent = (type: string) => {
    const components: Record<string, any> = {
        'hero': PagesBlocksHero,
        'super-hero': PagesBlocksSuperHero,
        'one-columns': PagesBlocksOneColumns,
        'two-columns': PagesBlocksTwoColumns,
        'three-columns': PagesBlocksThreeColumns,
        'gallery': PagesBlocksGallery,
        'separator': PagesBlocksSeparator,
        'cta': PagesBlocksCta,
        'faq': PagesBlocksFaq,
        'multi-cards': PagesBlocksMultiCards,
    };

    return components[type] || 'div';
};
</script>
