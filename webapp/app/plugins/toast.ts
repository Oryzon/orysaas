import Vue3Toastify, { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.server) {
        return {
            provide: {
                toast: () => undefined,
            },
        };
    }

    nuxtApp.vueApp.use(Vue3Toastify, {
        autoClose: 2000,
        newestOnTop: true,
        clearOnUrlChange: false,
    });

    return {
        provide: { toast },
    };
});
