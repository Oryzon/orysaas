import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { fr } from 'vuetify/locale';

// ─── Couleurs du thème — modifie uniquement les valeurs hex ───────────────────
const colors = {
    // Marque
    primary:    '#A855F7',
    secondary:  '#71717A',

    // Sémantique
    success:    '#10B981',
    info:       '#3B82F6',
    warning:    '#F59E0B',
    error:      '#EF4444',

    // Surfaces
    background: '#FFFFFF',
    surface:    '#1A1827',
};

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
        theme: {
            defaultTheme: 'dark',
            themes: {
                dark: {
                    dark: true,
                    colors,
                },
            },
        },
    });

    nuxtApp.vueApp.use(vuetify);
});
