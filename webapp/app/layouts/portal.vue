<template>
    <v-app>
        <v-navigation-drawer
            :rail="isCollapsed"
            class="bg-brand-dark"
            :class="{ 'drawer-collapsed': isCollapsed }"
            :width="300"
            @mouseenter="isHovering = true"
            @mouseleave="isHovering = false"
        >
            <div class="drawer-header">
                <img src="/logo.png" alt="OrySaas" width="28" height="34" />

                <span class="drawer-title">Ory<span class="text-primary">Saas</span></span>

                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>

                <v-btn variant="tonal" :color="!!menuIsOpen ? 'surface' : 'primary'" @click="toggleMenu" :width="48" :height="48" :min-width="0" rounded="lg">
                    <v-icon>mdi-menu</v-icon>
                </v-btn>
            </div>

            <v-divider />

            <v-list color="primary" base-color="white" nav>
                <v-list-item
                    rounded="xl"
                    prepend-icon="mdi-view-dashboard"
                    title="Tableau de bord"
                    to="/portal/dashboard"
                />

                <v-list-subheader class="mt-2 text-uppercase text-label-large" color="grey-lighten-2">Pilotage SaaS</v-list-subheader>

                <v-list-item
                    rounded="xl"
                    prepend-icon="mdi-file-tree"
                    title="Jobs"
                    to="/portal/jobs"
                />
            </v-list>
        </v-navigation-drawer>

        <v-app-bar height="82" color="navbar">
            <v-app-bar-title class="font-weight-black">{{ pageTitle }}</v-app-bar-title>

            <v-spacer></v-spacer>

            <v-btn variant="tonal" color="primary" :width="56" :height="56" :min-width="0" rounded="lg" class="mr-2">
                <v-icon size="32">mdi-bell-outline</v-icon>
            </v-btn>

            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn
                        :height="56"
                        :min-width="0"
                        variant="tonal"
                        rounded="lg"
                        class="mr-4 px-3"
                        v-bind="props"
                    >
                        <v-avatar
                            size="34"
                            class="gradient-primary mr-2"
                            rounded="0"
                        >
                            {{ userInitials }}
                        </v-avatar>

                        <div class="text-left">
                            <div class="text-body-2 font-weight-bold">{{ userName }}</div>
                            <div class="text-caption">{{ userRole }}</div>
                        </div>
                    </v-btn>
                </template>

                <v-list width="300px">
                <v-list-item @click="navigateTo('/admin/profil')">
                    <v-list-item-title>
                        <v-icon color="primary">mdi-cog</v-icon>
                        Profil
                    </v-list-item-title>
                </v-list-item>

                <v-list-item @click="logout()">
                    <v-list-item-title>
                        <v-icon color="red">mdi-logout</v-icon>
                        Déconnexion
                    </v-list-item-title>
                </v-list-item>
                </v-list>
            </v-menu>


        </v-app-bar>

        <v-main>
            <v-container fluid>
                <slot />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
const { menuIsOpen, toggleMenu } = useUserPreferences();
const { user, logout } = useAuth();

const pageTitle = useState('pageTitle');

const isHovering = ref(false);
const isCollapsed = computed(() => menuIsOpen.value && !isHovering.value);

const userInitials = computed(() => {
    if (!user.value) {
        return '?';
    }

    const f = user.value.firstname?.[0] ?? '';
    const l = user.value.lastname?.[0] ?? '';

    return (f + l).toUpperCase() || user.value.email[0].toUpperCase();
});

const userName = computed(() => {
    if (!user.value) {
        return '';
    }

    const parts = [user.value.firstname, user.value.lastname ? `${user.value.lastname[0]}.` : null].filter(Boolean);

    return parts.length ? parts.join(' ') : user.value.email;
});

const userRole = computed(() => {
    if (!user.value) {
        return '';
    }

    if (user.value.isSaasAdmin) {
        return 'Propriétaire';
    }

    return '';
});
</script>

<style scoped>
.drawer-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;
}

.drawer-title {
    margin-left: 5px;
    font-size: 18px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.05em;
    white-space: nowrap;
    transition: opacity 0.2s ease;
}

.drawer-collapsed .drawer-title {
    opacity: 0;
    pointer-events: none;
}

:deep(.v-navigation-drawer) {
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    z-index: 999 !important;
}

:deep(.v-app-bar) {
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.v-main) {
    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.v-list-item-title) {
    font-weight: 900;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.009375rem;
    white-space: nowrap;
    transition: opacity 0.2s ease;
}

:deep(.drawer-collapsed .v-list-item-title) {
    opacity: 0;
}

:deep(.v-list-item__prepend) {
    transition: margin-inline-end 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-list-item--active) {
    overflow: visible;
}

:deep(.v-list-item--active::before) {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 55%;
    background: linear-gradient(to bottom, var(--brand-primary), var(--brand-accent));
    border-radius: 0 3px 3px 0;
    z-index: 10;
}
</style>