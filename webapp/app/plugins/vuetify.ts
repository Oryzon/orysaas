import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { fr } from 'vuetify/locale';
import { brand } from '~/config/brand';

const colors = {
    primary:    brand.primary,
    secondary:  brand.secondary,
    success:    brand.success,
    info:       brand.info,
    warning:    brand.warning,
    error:      brand.error,
    surface:           brand.surface,
    'surface-light':   brand['surface-light'],
    'surface-variant': brand['surface-variant'],
    background:        brand.background,
    navbar:            brand.navbar,
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
                    dark: false,
                    colors,
                },
            },
        },
    });

    nuxtApp.vueApp.use(vuetify);
});
