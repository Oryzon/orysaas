<template>
    <div>
        <v-container v-if="isLoading" class="py-10 text-center">
            <v-progress-circular indeterminate />
        </v-container>

        <pages-blocks-renderer
            v-for="block in page?.blocks"
            :key="block.uuid"
            :block="block"
        />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const runtime = useRuntimeConfig();

const slugParam = Array.isArray(route.params.slug)
    ? route.params.slug.join('/')
    : route.params.slug || 'accueil';

const { data: page, pending: isLoading } = await useFetch(
    `${runtime.public.apiBase}page/slug/${slugParam}`,
    {
        key: `page:${slugParam}`,
    }
);

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page introuvable', fatal: true });
}

useSeoMeta({
    title: `${page.value?.metaTitle || page.value?.title}`,
    description: page.value?.metaDescription || '',
    ogTitle: 'OrySaas — Votre base de Saas, prête à décoller.',
    ogDescription: 'Auth, paiements, équipes, admin, emails. Tout est déjà branché. Vous n\'écrivez plus que la partie qui rend votre produit unique.',
    ogImage: 'https://orysaas.fr/og-image.jpg',
    ogUrl: 'https://orysaas.fr',
    twitterCard: 'summary_large_image'
});
</script>
