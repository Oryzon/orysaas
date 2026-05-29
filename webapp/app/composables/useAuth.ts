// composables/useAuth.ts
import type { User } from "~/models/User";
import { useNuxtApp } from "#app";
import type { OrganizationMemberRole } from "#shared/organization-roles";

type LoginDto = {
    stayConnected: any;
    email: string;
    password: string
};

type ResetDto = {
    uuidUser: string;
    newPassword: string;
    confNewPassword: string;
    password: string;
};

type Organization = { slug: string | null; name: string | null; logoUrl: string | null; nbMembers: number; role: OrganizationMemberRole | null };
type TokenPair = { token: string; refreshToken: string; organization?: Organization | null; message?: string };
type ForgotPasswordDto = { email: string };
type ResetPasswordDto = {
    token: string;
    newPassword: string;
    confNewPassword: string;
};

export const useAuth = () => {
    const api = useApi();
    const nuxtApp = useNuxtApp();

    const token = useCookie<string | null>("token", {
        sameSite: "lax",
        secure: !import.meta.dev,
        maxAge: 60 * 60 * 24 * 7,
    });

    const rToken = useCookie<string | null>("refreshToken", {
        sameSite: "lax",
        secure: !import.meta.dev,
    });

    const currentOrganization = useCookie<Organization | null>("organization", {
        sameSite: "lax",
        secure: !import.meta.dev,
        maxAge: 60 * 60 * 24 * 30,
    });

    const user = useState<User | null>("auth:user", () => null);
    const loggedIn = computed(() => !!token.value);

    async function login(payload: LoginDto) {
        const res = await api.post<TokenPair>("/auth/login", payload, {
            auth: false,
            loadingKey: "auth:login",
            toast: true,
        });

        token.value = res.token;
        currentOrganization.value = res.organization ?? null;

        const maxAge = payload.stayConnected ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

        const rTokenWithExpiry = await nuxtApp.runWithContext(() =>
            useCookie<string | null>('refreshToken', {
                sameSite: 'lax',
                secure: !import.meta.dev,
                maxAge,
            })
        );

        rTokenWithExpiry.value = res.refreshToken;

        if (res.token) {
            await refreshUser(res.token);
        }

        return res;
    }

    async function socialLogin(socialLoginToken: string) {
        const res = await api.post<TokenPair>(
            "/auth/social-login",
            { token: socialLoginToken },
            {
                auth: false,
                loadingKey: "auth:social-login",
                toast: true,
            },
        );

        token.value = res.token;
        rToken.value = res.refreshToken;
        currentOrganization.value = res.organization ?? null;

        if (res.token) {
            await refreshUser(res.token);
        }
    }

    async function refreshOrganization(slug?: string) {
        const org = await api.get<Organization>("/user/organization", {
            toast: false,
            loadingKey: "auth:organization",
            params: slug ? { slug } : undefined,
        });

        currentOrganization.value = org ?? null;
    }

    async function refreshUser(forceToken: string = "") {
        user.value = null;

        let datToken = forceToken || token.value;

        try {
            user.value = await api.get<User>("/user/me", {
                toast: false,
                loadingKey: "auth:login",
                headers: {
                    Authorization: `Bearer ${datToken}`,
                },
            });
        } catch (error) {
            console.error("Failed to load user", error);
            nuxtApp.runWithContext(() => navigateTo("/login"));
        }
    }

    async function logout(toast: boolean = true) {
        const res = await api.post<TokenPair>(
            "/auth/logout",
            { refreshToken: rToken.value },
            {
                toast: toast,
                auth: true,
                loadingKey: "auth:logout",
            },
        );

        token.value = null;
        rToken.value = null;
        user.value = null;
        currentOrganization.value = null;

        nuxtApp.runWithContext(() => navigateTo("/login"));
    }

    async function refresh() {
        if (!rToken.value) {
            token.value = null;
            user.value = null;

            throw new Error("No refresh token");
        }

        try {
            const res = await api.post<TokenPair>(
                "/auth/refresh",
                { refreshToken: rToken.value },
                {
                    auth: false,
                    toast: false,
                    loadingKey: "auth:refresh",
                },
            );

            token.value = res.token;
        } catch (err) {
            token.value = null;
            rToken.value = null;
            user.value = null;
            currentOrganization.value = null;

            throw err;
        }
    }

    async function forgotPassword(payload: ForgotPasswordDto) {
        return await api.post("/auth/forgot-password", payload, {
            auth: false,
            loadingKey: "auth:forgot-password",
            toast: true,
        });
    }

    async function resetPassword(payload: ResetPasswordDto) {
        return await api.post("/auth/reset-password", payload, {
            auth: false,
            loadingKey: "auth:reset-password",
            toast: true,
        });
    }

    return {
        user,
        loggedIn,
        currentOrganization,
        login,
        logout,
        refresh,
        refreshUser,
        refreshOrganization,
        forgotPassword,
        resetPassword,
        socialLogin,
    };
};
