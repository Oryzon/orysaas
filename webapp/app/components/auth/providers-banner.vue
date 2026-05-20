<template>
    <v-row class="mb-3">
        <v-col v-for="provider in providers" :key="provider.name" md="4">
            <v-btn
                block
                variant="outlined"
                color="grey-darken-1"
                @click="provider.action"
            >
                <template v-slot:prepend>
                    <icons-google-svg-icon v-if="provider.key === 'google'" />
                    <icons-facebook-svg-icon
                        v-else-if="provider.key === 'facebook'"
                    />
                    <icons-microsoft-svg-icon
                        v-else-if="provider.key === 'microsoft'"
                    />
                </template>

                {{ provider.name }}
            </v-btn>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

type OAuthProvider = "google" | "facebook" | "microsoft";

const launchOAuth = (provider: {
    key: OAuthProvider;
    rootUrl: string;
    clientId: string;
    scope: string;
    extraParams?: Record<string, string>;
}) => {
    if (!provider.clientId) {
        alert(`${provider.key} n'est pas configuré.`);
        return;
    }

    const params = new URLSearchParams({
        client_id: provider.clientId,
        redirect_uri: `${config.public.apiBase}auth/callback/${provider.key}`,
        response_type: "code",
        scope: provider.scope,
        ...(provider.extraParams || {}),
    });

    window.location.href = `${provider.rootUrl}?${params.toString()}`;
};

const loginWithGoogle = () => {
    launchOAuth({
        key: "google",
        rootUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        clientId: config.public.googleClientId,
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
        extraParams: {
            access_type: "offline",
            prompt: "consent",
        },
    });
};

const loginWithFacebook = () => {
    launchOAuth({
        key: "facebook",
        rootUrl: "https://www.facebook.com/v20.0/dialog/oauth",
        clientId: config.public.facebookAppId as string,
        scope: ["email", "public_profile"].join(","),
    });
};

const loginWithMicrosoft = () => {
    launchOAuth({
        key: "microsoft",
        rootUrl: `https://login.microsoftonline.com/${config.public.microsoftTenantId}/oauth2/v2.0/authorize`,
        clientId: config.public.microsoftClientId,
        scope: [
            "openid",
            "profile",
            "email",
            "offline_access",
            "User.Read",
        ].join(" "),
    });
};

const providers: {
    name: string;
    key: string;
    iconColor?: string;
    action: () => void;
}[] = [
    {
        name: "Google",
        key: "google",
        action: loginWithGoogle,
    },
    {
        name: "Facebook",
        key: "facebook",
        action: loginWithFacebook,
    },
    {
        name: "Microsoft",
        key: "microsoft",
        action: loginWithMicrosoft,
    },
];
</script>

<style scoped>
.custom-btn {
    border: 1px solid #cacaca !important;
    color: #333333 !important;
}
</style>
