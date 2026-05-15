import { useNuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to) => {
    const nuxtApp = useNuxtApp();
    const { loggedIn, user, refreshUser, token, rToken } = useAuth();

    const queryToken = typeof to.query.token === "string" ? to.query.token : "";
    const queryRefreshToken =
        typeof to.query.refreshToken === "string" ? to.query.refreshToken : "";

    if (queryToken) {
        token.value = queryToken;
    }

    if (queryRefreshToken) {
        rToken.value = queryRefreshToken;
    }

    if (!loggedIn.value) {
        return navigateTo("/login");
    }

    if (!user.value) {
        await nuxtApp.runWithContext(() => refreshUser());
    }
});
