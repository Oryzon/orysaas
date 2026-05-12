// composables/useAuth.ts
import type { User } from "~/models/User";

type LoginDto = { username: string; password: string }
type ResetDto = { uuidUser: string, newPassword: string, confNewPassword: string, username: string, password: string }
type TokenPair = { token: string; refreshToken: string; message?: string }
type ForgotPasswordDto = { email: string }
type ResetPasswordDto = { token: string, newPassword: string, confNewPassword: string }

export const useAuth = () => {
    const api = useApi();

    const token = useCookie<string | null>('token', {
        sameSite: 'lax',
        secure: !import.meta.dev,
        maxAge: 60 * 60 * 24 * 7
    });

    const rToken = useCookie<string | null>('refreshToken', {
        sameSite: 'lax',
        secure: !import.meta.dev,
        maxAge: 60 * 60 * 24 * 30
    });

    const user = useState<User | null>('auth:user', () => null);
    const permissionsLoaded = useState<boolean>('auth:permissionsLoaded', () => false); // 👈 NOUVEAU
    const loggedIn = computed(() => !!token.value);

    async function login(payload: LoginDto) {
        const res = <TokenPair><unknown>await api.post<TokenPair>('/auth/login', payload, {
            auth: false,
            loadingKey: 'auth:login',
            toast: true,
        });

        token.value = res.token;
        rToken.value = res.refreshToken;

        if (res.token) {
            await refreshUser(res.token);
        }

        return res;
    }

    async function refreshUser(forceToken: string = '') {
        permissionsLoaded.value = false;
        user.value = null;

        let datToken = forceToken || token.value;

        try {
            user.value = <User><unknown>await api.get<User>('/user/me', {
                toast: false,
                loadingKey: 'auth:login',
                headers: {
                    Authorization: `Bearer ${datToken}`,
                },
            });
        } catch (error) {
            console.error('Failed to load user', error);
            navigateTo('/admin/login');
        } finally {
            permissionsLoaded.value = true;
        }
    }

    async function logout(toast: boolean = true) {
        const res = <unknown>await api.post<TokenPair>('/auth/logout', { refreshToken: rToken.value }, {
            toast: toast,
            auth: false,
            loadingKey: 'auth:logout'
        });

        token.value = null;
        rToken.value = null;
        user.value = null;
        permissionsLoaded.value = false;

        navigateTo('/admin/login');
    }

    async function resetAndLogin(payload: ResetDto) {
        const res = <TokenPair><unknown>await api.post<TokenPair>('/auth/login-reset', payload, {
            auth: false,
            loadingKey: 'auth:login-reset',
            toast: true,
        });

        token.value = res.token;
        rToken.value = res.refreshToken;

        await refreshUser();

        return res;
    }

    async function refresh() {
        if (!rToken.value) {
            return;
        }

        const res = <TokenPair><unknown>await api.post<TokenPair>('/auth/refresh', { refreshToken: rToken.value }, {
            auth: false,
            toast: false,
            loadingKey: 'auth:refresh'
        });

        token.value = res.token;
    }

    async function forgotPassword(payload: ForgotPasswordDto) {
        return await api.post('/auth/forgot-password', payload, {
            auth: false,
            loadingKey: 'auth:forgot-password',
            toast: true,
        });
    }

    async function resetPassword(payload: ResetPasswordDto) {
        return await api.post('/auth/reset-password', payload, {
            auth: false,
            loadingKey: 'auth:reset-password',
            toast: true,
        });
    }

    return {
        user,
        loggedIn,
        permissionsLoaded,
        login,
        logout,
        resetAndLogin,
        refresh,
        refreshUser,
        forgotPassword,
        resetPassword,
    }
}
