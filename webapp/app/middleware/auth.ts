import { useNuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to) => {
    const nuxtApp = useNuxtApp();
    const { loggedIn, user, refreshUser } = useAuth();

    if (!loggedIn.value) {
        return navigateTo('/login');
    }

    if (!user.value) {
        nuxtApp.runWithContext(() => { refreshUser()});
    }
});