// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
    alias: {
        '#shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: true,
    },
    modules: ["@nuxtjs/seo", "@pinia/nuxt", "@vueuse/nuxt"],
    site: {
        name: 'OrySaas',
        url: process.env.SITE_URL || 'http://localhost:3000',
    },
    css: [
        "vuetify/styles",
        "@mdi/font/css/materialdesignicons.css",
        "~/assets/css/main.css",
        "@vueup/vue-quill/dist/vue-quill.snow.css",
    ],
    devServer: {
        port: Number(process.env.PORT) || 3000,
    },
    build: {
        transpile: ["vuetify", "toast"],
    },
    vite: {
        ssr: {
            noExternal: ["vuetify"],
        },
        optimizeDeps: {
            include: [
                "@vue/devtools-core",
                "@vue/devtools-kit",
                "vuetify",
                "@mdi/js",
                "luxon",
            ],
        },
    },
    runtimeConfig: {
        public: {
            title: "OrySaas",
            // @ts-ignore
            apiBase: process.env.API_URL || "http://localhost:3001/v1/",
            googleClientId: process.env.GOOGLE_CLIENT_ID || "",
            facebookAppId: process.env.FACEBOOK_APP_ID || "",
            microsoftClientId: process.env.MICROSOFT_CLIENT_ID || "",
            microsoftTenantId: process.env.MICROSOFT_TENANT_ID || "common",
        },
    },
    ogImage: { zeroRuntime: true },
});
