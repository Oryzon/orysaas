import type { Notification } from '~/models/Notification';

let _eventSource: EventSource | null = null;
let _retryCount = 0;
let _retryResetTimer: ReturnType<typeof setTimeout> | null = null;

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]!));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

export const useNotifications = () => {
    const api = useApi();
    const runtime = useRuntimeConfig();
    const { refresh: refreshToken } = useAuth();

    const notifications = useState<Notification[]>('notifications:list', () => []);
    const nextCursor = useState<string | null>('notifications:cursor', () => null);
    const isLoadingMore = useState<boolean>('notifications:loading-more', () => false);
    const unreadCount = useState<number>('notifications:unread-count', () => 0);

    async function connect() {
        if (!import.meta.client) {
            return;
        }

        if (_eventSource?.readyState === EventSource.OPEN) {
            return;
        }

        const tokenCookie = useCookie('token');
        let token = tokenCookie.value;

        if (!token) {
            return;
        }

        if (isTokenExpired(token)) {
            try {
                await refreshToken();
                token = tokenCookie.value;
                if (!token) return;
            } catch {
                return;
            }
        }

        _eventSource?.close();

        const base = runtime.public.apiBase.toString().replace(/\/$/, '');
        _eventSource = new EventSource(`${base}/notifications/stream?token=${token}`);

        _eventSource.addEventListener('connected', () => {
            _retryCount = 0;
            fetchRecent();
        });

        _eventSource.addEventListener('notification', (e: MessageEvent) => {
            const notif = JSON.parse(e.data) as Notification;
            notifications.value.unshift(notif);
            unreadCount.value++;
        });

        _eventSource.onerror = async () => {
            _retryCount++;

            if (_retryResetTimer) {
                clearTimeout(_retryResetTimer);
            }

            _retryResetTimer = setTimeout(() => { _retryCount = 0; }, 30_000);

            if (_retryCount >= 3) {
                _retryCount = 0;
                _eventSource?.close();
                _eventSource = null;

                try {
                    await refreshToken();
                    connect();
                } catch {
                    disconnect();
                }
            }
        };
    }

    function disconnect() {
        _eventSource?.close();
        _eventSource = null;
        _retryCount = 0;

        if (_retryResetTimer) {
            clearTimeout(_retryResetTimer);
        }

        notifications.value = [];
    }

    async function fetchRecent() {
        const data = await api.get<{ items: Notification[], nextCursor: string | null, totalUnread: number }>('/notifications', { toast: false });
        notifications.value = data.items;
        nextCursor.value = data.nextCursor;
        unreadCount.value = data.totalUnread;
    }

    async function fetchMore() {
        if (!nextCursor.value || isLoadingMore.value) {
            return;
        }

        isLoadingMore.value = true;

        try {
            const data = await api.get<{ items: Notification[], nextCursor: string | null }>('/notifications', {
                toast: false,
                params: { cursor: nextCursor.value }
            });

            notifications.value = [...notifications.value, ...data.items];
            nextCursor.value = data.nextCursor;
        } finally {
            isLoadingMore.value = false;
        }
    }

    async function markAsRead(uuid: string) {
        await api.get(`/notification/${uuid}/read`, {
            toast: false
        });

        const notif = notifications.value.find(n => n.uuid === uuid);

        if (notif && !notif.readAt) {
            notif.readAt = new Date().toISOString();
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
    }

    async function markAllAsRead() {
        await api.get('/notifications/read', {
            toast: false
        });

        notifications.value.forEach(n => {
            if (!n.readAt) {
                n.readAt = new Date().toISOString();
            }
        });

        unreadCount.value = 0;
    }

    return {
        notifications,
        nextCursor,
        isLoadingMore,
        unreadCount: computed(() => unreadCount.value),
        connect,
        disconnect,
        fetchMore,
        markAsRead,
        markAllAsRead,
    };
};