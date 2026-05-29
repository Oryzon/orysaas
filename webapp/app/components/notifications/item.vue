<template>
    <v-list-item
        rounded="lg"
        class="notification-item mb-1"
        :class="{ 'notification-item--unread': !notification.readAt }"
        @click="handleMarkAsRead"
        lines="three"
    >
        <template #prepend>
            <v-avatar :color="notif.color" size="42" rounded="lg" class="mr-3">
                <v-icon :icon="notif.icon" size="20" color="white" />
            </v-avatar>
        </template>

        <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-body-2 font-weight-bold notification-title">
                {{ notif.label }}
            </span>

            <small class="text-high-emphasis opacity-60 text-no-wrap ml-2">
                {{ $date.french(notification.createdAt) }}
            </small>
        </div>

        <p class="text-caption mt-n1">
            {{ text }}
        </p>

        <div v-if="notification.actions && !notification.readAt" class="d-flex gap-1 mt-n3">
            <v-btn
                class="mr-2"
                v-for="action in notification.actions"
                :key="action.label"
                :color="action.color ?? 'primary'"
                height="32"
                @click="handleAction(action.endpoint)"
            >
                <v-icon v-if="action.icon">{{ action.icon }}</v-icon>

                <span v-if="action.icon && action.label">&nbsp;</span>

                {{ action.label }}
            </v-btn>
        </div>
    </v-list-item>
</template>

<script setup lang="ts">
import { NOTIFICATION_TYPES, type NotificationAction } from "#shared/notification-types";
import type { Notification } from '~/models/Notification';

const { markAsRead } = useNotifications();
const { refreshOrganization } = useAuth();
const api = useApi();
const router = useRouter();

const props = defineProps<{
    notification: Notification
}>();

const notif = computed(() => NOTIFICATION_TYPES[props.notification.type]);
const text = computed(() => notif.value.template(props.notification.payload as any));

const handleMarkAsRead = () => {
    markAsRead(props.notification.uuid);
};

const handleAction = async (endpoint: string) => {
    const action = props.notification.actions?.find((action: NotificationAction) => action.endpoint === endpoint);

    if (!action) {
        return;
    }

    const res = await api.post<{ message: string }>(
        action.endpoint,
        action.body ?? {},
        {
            loadingKey: `notification:action:${props.notification.uuid}`,
            toast: true,
        },
    );

    if (res) {
        await markAsRead(props.notification.uuid);

        if (action.refreshOrganization) {
            const slug = action.redirect?.split('/portal/')?.[1]?.split('/')?.[0];
            await refreshOrganization(slug);
        }

        if (action.redirect) {
            await router.push(action.redirect);
        }
    }
};
</script>