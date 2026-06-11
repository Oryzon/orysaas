<template>
    <v-row class="mb-3">
        <v-col v-for="provider in visibleProviders" :key="provider.name" :md="providerColumnMd">
            <v-btn block variant="outlined" color="grey-darken-1" @click="provider.action">
                <template v-slot:prepend>
                    <icons-google-svg-icon v-if="provider.key === 'google'" />
                    <icons-facebook-svg-icon v-else-if="provider.key === 'facebook'" />
                    <icons-microsoft-svg-icon v-else-if="provider.key === 'microsoft'" />
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
        scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(" "),
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
        scope: ["openid", "profile", "email", "offline_access", "User.Read"].join(" "),
    });
};

const providers: {
    name: string;
    key: string;
    iconColor?: string;
    action: () => void;
    env?: string[];
}[] = [
    {
        name: "Google",
        key: "google",
        action: loginWithGoogle,
        env: ["googleClientId"],
    },
    {
        name: "Facebook",
        key: "facebook",
        action: loginWithFacebook,
        env: ["facebookAppId"],
    },
    {
        name: "Microsoft",
        key: "microsoft",
        action: loginWithMicrosoft,
        env: ["microsoftClientId", "microsoftTenantId"],
    },
];

const hasAllRequiredEnv = (envKeys?: string[]) => {
    if (!envKeys?.length) {
        return true;
    }

    return envKeys.every((envKey) => {
        const value = config.public?.[envKey as keyof typeof config.public];
        return value !== undefined && value !== null && String(value).trim() !== "";
    });
};

const visibleProviders = computed(() => providers.filter((provider) => hasAllRequiredEnv(provider.env)));

const providerColumnMd = computed(() => {
    const count = visibleProviders.value.length;
    if (!count) {
        return 12;
    }

    return Math.max(1, Math.floor(12 / count));
});
</script>

<style scoped>
.custom-btn {
    border: 1px solid #cacaca !important;
    color: #333333 !important;
}
</style>
