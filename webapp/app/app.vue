<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
import { brand } from '~/config/brand';

useHead({
    style: [{
        innerHTML: `
            :root {
                --brand-primary: ${brand.primary};
                --brand-accent:  ${brand.accent};
                --brand-bg-dark: ${brand.bgDark};
                --brand-bg-mid:  ${brand.bgMid};
                --brand-bg-deep: ${brand.bgDeep};
            }
        `,
    }],
});
</script>