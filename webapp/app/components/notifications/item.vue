<template>
    <v-list-item
        rounded="lg"
        class="notification-item mb-1"
        :class="{ 'notification-item--unread': !notification.readAt }"
        @click="handleMarkAsRead"
    >
        <template #prepend>
            <v-avatar :color="notif.color" size="42" rounded="lg" class="mr-3">
                <v-icon :icon="notif.icon" size="20" color="white" />
            </v-avatar>
        </template>

        <v-list-item-title class="text-body-2 font-weight-bold mb-1">
            {{ notif.label }}
            <span class="float-right font-weight-light text-body-small mt-1">{{ $date.french(notification.createdAt) }}</span>
        </v-list-item-title>

        <v-list-item-subtitle class="text-caption">
            {{ text }}
        </v-list-item-subtitle>
    </v-list-item>
</template>

<script setup lang="ts">
import { NOTIFICATION_TYPES } from '#shared/notification-types';
import type { Notification } from '~/models/Notification';
const { markAsRead } = useNotifications();

const props = defineProps<{
    notification: Notification
}>();

const notif = computed(() => NOTIFICATION_TYPES[props.notification.type]);
const text = computed(() => notif.value.template(props.notification.payload as any));

const handleMarkAsRead = () => {
    markAsRead(props.notification.uuid);
}
</script>