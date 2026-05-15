<template>
    <v-btn color="primary" @click="loginWithGoogle" prepend-icon="mdi-google">
        S'identifier avec Google
    </v-btn>
</template>

<script setup>
const config = useRuntimeConfig();

const loginWithGoogle = () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
        redirect_uri: `${config.public.apiBase}auth/callback/google`,
        client_id: config.public.googleClientId,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
};
</script>
