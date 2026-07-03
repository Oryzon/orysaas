import { useNuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to) => {
    const nuxtApp = useNuxtApp();
    const { loggedIn, user, refreshUser, socialLogin } = useAuth();
    const socialToken = Array.isArray(to.query.social_token) ? to.query.social_token[0] : to.query.social_token;

    if (typeof socialToken === "string" && socialToken.length > 0) {
        if (import.meta.server) {
            // Let client-side middleware exchange the one-time social token.
            return;
        }

        try {
            await socialLogin(socialToken);
        } catch {
            return navigateTo("/login");
        }

        const query = { ...to.query };
        delete query.social_token;

        return navigateTo({ path: to.path, query, hash: to.hash }, { replace: true });
    }

    if (!loggedIn.value) {
        return navigateTo("/login");
    }

    if (!user.value) {
        try {
            await nuxtApp.runWithContext(() => refreshUser());
        } catch {
            return navigateTo("/login");
        }
    }
});
