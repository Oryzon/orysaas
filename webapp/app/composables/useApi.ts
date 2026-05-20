type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions<TBody = any> {
    params?: Record<string, any>;
    body?: TBody;
    headers?: Record<string, string>;
    /** Add Authorization header automatically (default: true) */
    auth?: boolean;
    /** Show toasts (true = default messages) */
    toast?: boolean;
    /** Key to track global loading state: e.g. "users:list" */
    loadingKey?: string;
    /** Override baseURL (otherwise uses runtimeConfig.public.apiBase or '/api') */
    baseURL?: string;
    /** Abort an existing request with same key before starting (default: false) */
    dedupeKey?: string;
    /** Force JSON content-type (auto-skips for FormData) */
    json?: boolean;
}

export const useApi = () => {
    // Global maps live across components
    const loaders = useState<Record<string, boolean>>(
        "api:loaders",
        () => ({}),
    );
    const controllers = ref<Map<string, AbortController>>(new Map());

    const loading = ref(false);

    const runtime = useRuntimeConfig();
    const nuxtApp = useNuxtApp();

    const getToken = () => {
        const cookie = useCookie<string | null>("token");
        return cookie.value ?? null;
    };

    const setLoader = (key: string | undefined, val: boolean) => {
        if (!key) {
            return;
        }

        loaders.value[key] = val;

        if (!val) {
            delete loaders.value[key];
        }
    };

    const isLoading = (key?: string) => {
        if (!key) {
            return loading.value;
        }

        return loaders.value[key];
    };

    const showToast = (type: "success" | "error" | "info", message: string) => {
        if (!import.meta.client) {
            // Toast library is browser-only; avoid SSR crashes.
            console[type === "error" ? "error" : "log"](`[${type}] ${message}`);
            return;
        }

        const t = nuxtApp.$toast as
            | undefined
            | ((msg: string, opts?: any) => void);

        if (t) {
            t(message, { type });
        } else {
            console[type === "error" ? "error" : "log"](`[${type}] ${message}`);
        }
    };

    const makeHeaders = (opts?: ApiOptions) => {
        const headers: Record<string, string> = {
            ...(opts?.headers || {}),
        };

        // Content-Type: auto-skip for FormData
        const isForm =
            typeof FormData !== "undefined" && opts?.body instanceof FormData;

        if (!isForm && (opts?.json ?? true)) {
            headers["Content-Type"] =
                headers["Content-Type"] || "application/json";
        }

        if (opts?.auth !== false) {
            const token = getToken();

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    };

    if (import.meta.client && getCurrentInstance()) {
        onUnmounted(() => abortAll());
    }

    const abort = (key?: string) => {
        if (!key) {
            return;
        }

        const c = controllers.value.get(key);

        if (c) {
            c.abort();
            controllers.value.delete(key);
            setLoader(key, false);
        }
    };

    const abortAll = () => {
        for (const [key, c] of controllers.value.entries()) {
            c.abort();
            controllers.value.delete(key);
            setLoader(key, false);
        }
    };

    const request = async <T = unknown, TBody = any>(
        method: HttpMethod,
        url: string,
        opts: ApiOptions<TBody> = {},
    ): Promise<T> => {
        const baseURL = opts.baseURL ?? runtime.public.apiBase ?? "/api";
        const key = opts.loadingKey ?? `${method}:${url}`;
        const dedupeKey = opts.dedupeKey;

        // Dedupe (abort previous with same key)
        if (dedupeKey) {
            abort(dedupeKey);
        }

        const controller = new AbortController();
        if (key) {
            controllers.value.set(key, controller);
        }

        setLoader(key, true);
        loading.value = true;

        const headers = makeHeaders(opts);

        try {
            const data = (await $fetch<any>(url, {
                method,
                baseURL,
                params: opts.params,
                body: opts.body as any,
                headers,
                signal: controller.signal,
            })) as T;

            if (opts.toast) {
                showToast("success", (data as any)?.message ?? "Action OK.");
            }

            return data;
        } catch (err: any) {
            if (
                controller.signal.aborted ||
                err?.name === "AbortError" ||
                err?.cause?.name === "AbortError" ||
                err?.message?.includes("aborted")
            ) {
                return undefined as any;
            }

            const status = err?.status ?? err?.response?.status;

            if (status === 403) {
                await nuxtApp.runWithContext(() => navigateTo("/login"));
                showToast("error", "Vous n'avez pas accès a cette page.");

                throw status;
            }

            if (status === 401) {
                try {
                    await nuxtApp.runWithContext(() => useAuth().refresh());
                } catch {
                    await nuxtApp.runWithContext(() => navigateTo("/login"));
                    throw err;
                }

                try {
                    const replayHeaders = makeHeaders(opts);
                    const data = (await $fetch<any>(url, {
                        method,
                        baseURL,
                        params: opts.params,
                        body: opts.body as any,
                        headers: replayHeaders,
                        signal: controller.signal,
                    })) as T;

                    if (opts.toast) {
                        showToast(
                            "success",
                            (data as any)?.message ?? "Action OK.",
                        );
                    }

                    return data;
                } catch (err: any) {
                    const replayStatus = err?.status ?? err?.response?.status;

                    if (replayStatus === 401) {
                        await nuxtApp.runWithContext(() =>
                            navigateTo("/login"),
                        );
                        throw err;
                    }

                    const apiMsg =
                        err?.data?.message ||
                        err?.response?._data?.message ||
                        err?.message ||
                        `Request failed${status ? ` (${status})` : ""}`;

                    if (opts.toast !== false) {
                        showToast("error", apiMsg);
                    }

                    throw err;
                }
            } else {
                const apiMsg =
                    err?.data?.message ||
                    err?.response?._data?.message ||
                    err?.message ||
                    `Request failed${status ? ` (${status})` : ""}`;

                if (opts.toast !== false) {
                    showToast("error", apiMsg);
                }

                throw err;
            }
        } finally {
            controllers.value.delete(key);
            setLoader(key, false);
            loading.value = false;
        }
    };

    // Shorthand helpers
    const get = <T = unknown>(url: string, opts?: ApiOptions) =>
        request<T>("GET", url, opts);
    const post = <T = unknown, B = any>(
        url: string,
        body?: B,
        opts?: ApiOptions<B>,
    ) => request<T, B>("POST", url, { ...(opts || {}), body });
    const put = <T = unknown, B = any>(
        url: string,
        body?: B,
        opts?: ApiOptions<B>,
    ) => request<T, B>("PUT", url, { ...(opts || {}), body });
    const patch = <T = unknown, B = any>(
        url: string,
        body?: B,
        opts?: ApiOptions<B>,
    ) => request<T, B>("PATCH", url, { ...(opts || {}), body });
    const remove = <T = unknown>(url: string, opts?: ApiOptions) =>
        request<T>("DELETE", url, opts);

    return {
        // core
        request,
        get,
        post,
        put,
        patch,
        remove,
        // loading
        loading,
        loaders,
        isLoading,
        // cancelation
        abort,
        abortAll,
    };
};
