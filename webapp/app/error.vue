<template>
    <v-container fluid class="error-page fill-height d-flex align-center justify-center">
        <div class="text-center">
            <div class="error-number">404</div>

            <div class="error-content">
                <!-- Logo -->
                <v-img
                    src="/logo.png"
                    alt="OryScorp"
                    width="240"
                    class="mx-auto mb-8"
                />

                <v-icon size="64" color="primary" class="mb-4">mdi-robot-confused-outline</v-icon>

                <h1 class="text-h4 font-weight-bold mb-2">Vous semblez perdu ?</h1>
                <p class="text-body-1 text-medium-emphasis mb-8 mx-auto" style="max-width: 400px">
                    Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer.
                </p>

                <v-btn to="/accueil" color="primary" size="large" rounded="lg" prepend-icon="mdi-home">
                    Retour à l'accueil
                </v-btn>
            </div>
        </div>
    </v-container>
</template>

<script setup>
const error = useError();
const runtime = useRuntimeConfig();

useSeoMeta({
    title: `Oopsie... - ${runtime.public.title}`,
    description: 'Encore un utilisateur perdu...',
    ogTitle: 'OryScorp — Agence web développement sur mesure',
    ogDescription: 'Sites vitrines, scripts, outils métier. Des solutions digitales adaptées à votre activité.',
    ogImage: 'https://oryscorp.fr/og-image.jpg',
    ogUrl: 'https://oryscorp.fr',
    twitterCard: 'summary_large_image'
});
</script>

<style scoped>
.error-page {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
}

.error-number {
    font-size: clamp(8rem, 20vw, 18rem);
    font-weight: 900;
    line-height: 1;
    color: rgba(var(--v-theme-primary), 0.08);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    user-select: none;
    white-space: nowrap;
}

.error-content {
    position: relative;
    z-index: 1;
}
</style>
