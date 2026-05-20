<template>
    <div class="notif-panel fill-height">
        <div class="px-4 pt-4 pb-3 flex-shrink-0">
            <span class="text-subtitle-1 font-weight-black">Notifications</span>

            <v-btn
                v-if="unreadCount > 0"
                class="mt-n2 float-end"
                variant="tonal"
                color="primary"
                @click="markAllAsRead"
            >
                Tout lire
            </v-btn>
        </div>

        <v-divider class="flex-shrink-0"></v-divider>

        <div
            v-if="notifications.length === 0"
            class="mt-6 text-center text-medium-emphasis"
        >
            Vous n'avez pas de notification.
        </div>

        <div v-else class="overflow-y-auto flex-grow-1">
            <transition-group
                tag="div"
                name="notif-list"
                appear
                class="pa-2"
            >
                <notifications-item
                    v-for="(notif, i) in notifications"
                    :key="notif.uuid"
                    :notification="notif"
                    :style="{ '--notif-delay': `${i * 40}ms` }"
                ></notifications-item>
            </transition-group>
        </div>
    </div>
</template>

<script setup lang="ts">
const { notifications, unreadCount, markAllAsRead } = useNotifications();
</script>