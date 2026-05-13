export default defineNuxtRouteMiddleware(async (to) => {
    const { loggedIn, user, refreshUser } = useAuth();

    if (!loggedIn.value) {
        return navigateTo('/login');
    }

    if (!user.value) {
        await refreshUser();
    }
});