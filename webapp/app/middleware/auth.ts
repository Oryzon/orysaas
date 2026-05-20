import { useNuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to) => {
    const nuxtApp = useNuxtApp();
    const { loggedIn, user, refreshUser, socialLogin } = useAuth();

    if (to.query.social_token) {
        await socialLogin(to.query.social_token as string);

        to.query = {};

        return navigateTo(to, { replace: true });
    }

    if (!loggedIn.value) {
        return navigateTo("/login");
    }

    if (!user.value) {
        await nuxtApp.runWithContext(() => refreshUser());
    }
});
