import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { fr } from 'vuetify/locale';

export default defineNuxtPlugin((nuxtApp) => {
    const vuetify = createVuetify({
        ssr: true,
        components,
        directives,
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: { mdi },
        },
        locale: {
            locale: 'fr',
            fallback: 'en',
            messages: { fr },
        },
    });

    nuxtApp.vueApp.use(vuetify);
});
