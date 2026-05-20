<template>
    <v-badge
        :content="unreadCount"
        :model-value="unreadCount > 0"
        color="primary"
        floating
        offset-x="28"
        offset-y="22"
        :class="{ 'badge-pulse': badgePulse }"
    >
        <v-btn
            @click="drawerOpen = !drawerOpen"
            variant="tonal"
            :color="unreadCount > 0 ? 'primary' : ''"
            :width="56"
            :height="56"
            :min-width="0"
            rounded="lg"
            class="mr-2"
        >
            <v-icon
                size="32"
                :class="{ 'bell-ring': ringing }"
            >
                mdi-bell-outline
            </v-icon>
        </v-btn>
    </v-badge>
</template>

<script setup lang="ts">
const drawerOpen = useState('notif:drawer:open', () => false);
const { unreadCount } = useNotifications();

const ringing = ref(false);
const badgePulse = ref(false);

watch(unreadCount, (newVal, oldVal) => {
    if (newVal > oldVal) {
        ringing.value = true;
        badgePulse.value = true;

        setTimeout(() => { ringing.value = false; }, 800);
        setTimeout(() => { badgePulse.value = false; }, 600);
    }
});
</script>