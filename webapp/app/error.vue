<template>
    <v-container fluid class="error-page fill-height d-flex align-center justify-center">
        <div class="text-center">
            <div class="error-number">{{ statusCode }}</div>

            <div class="error-content">
                <!-- Logo -->
                <v-img src="/logo.png" alt="OryScorp" width="240" class="mx-auto mb-8" />

                <v-icon size="64" color="primary" class="mb-4">{{ icon }}</v-icon>

                <h1 class="text-h4 font-weight-bold mb-2">{{ title }}</h1>
                <p class="text-body-1 text-medium-emphasis mb-8 mx-auto" style="max-width: 400px">
                    {{ message }}
                </p>

                <v-btn
                    v-if="is404"
                    to="/accueil"
                    color="primary"
                    size="large"
                    rounded="lg"
                    prepend-icon="mdi-home"
                >
                    Retour à l'accueil
                </v-btn>

                <template v-else>
                    <v-btn
                        color="primary"
                        size="large"
                        rounded="lg"
                        prepend-icon="mdi-refresh"
                        class="mr-2"
                        @click="handleRetry"
                    >
                        Réessayer
                    </v-btn>

                    <v-btn to="/accueil" color="primary" variant="text" size="large" rounded="lg" prepend-icon="mdi-home">
                        Retour à l'accueil
                    </v-btn>
                </template>
            </div>
        </div>
    </v-container>
</template>

<script setup>
const error = useError();
const runtime = useRuntimeConfig();

const statusCode = computed(() => error.value?.statusCode ?? 500);
const is404 = computed(() => statusCode.value === 404);

const icon = computed(() => (is404.value ? "mdi-robot-confused-outline" : "mdi-alert-circle-outline"));

const title = computed(() => (is404.value ? "Vous semblez perdu ?" : "Une erreur est survenue"));

const message = computed(() =>
    is404.value
        ? "Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer."
        : "Quelque chose s'est mal passé de notre côté. Réessayez dans quelques instants.",
);

const handleRetry = () => clearError({ redirect: "/accueil" });

useSeoMeta({
    title: `Oopsie... - ${runtime.public.title}`,
    description: "Encore un utilisateur perdu...",
    ogTitle: "OryScorp — Agence web développement sur mesure",
    ogDescription: "Sites vitrines, scripts, outils métier. Des solutions digitales adaptées à votre activité.",
    ogImage: "https://oryscorp.fr/og-image.jpg",
    ogUrl: "https://oryscorp.fr",
    twitterCard: "summary_large_image",
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
