// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: true
    },
    modules: [
        '@nuxtjs/seo',
        '@pinia/nuxt',
        '@vueuse/nuxt'
    ],
    css: [
        'vuetify/styles',
        '@mdi/font/css/materialdesignicons.css',
        '~/assets/css/main.css'
    ],
    devServer: {
        port: Number(process.env.PORT) || 3000,
    },
    build: {
        transpile: [
            'vuetify',
            'toast',
        ]
    },
    vite: {
        ssr: {
            noExternal: ['vuetify'],
        },
        optimizeDeps: {
            include: [
                '@vue/devtools-core',
                '@vue/devtools-kit',
                'vuetify',
                '@mdi/js',
                'luxon',
            ],
        },
    },
    runtimeConfig: {
        public: {
            title: 'OrySaas',
            // @ts-ignore
            apiBase: process.env.API_URL || 'http://localhost:3001/v1/'
        }
    },
    ogImage: { zeroRuntime: true }
})