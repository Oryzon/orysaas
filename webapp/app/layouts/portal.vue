<template>
    <v-app>
        <v-navigation-drawer
            :rail="isCollapsed"
            class="bg-brand-dark main-nav"
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

                <v-btn
                    variant="tonal"
                    :color="!!menuIsOpen ? 'surface' : 'primary'"
                    @click="toggleMenu"
                    :width="48"
                    :height="48"
                    :min-width="0"
                    rounded="lg"
                >
                    <v-icon>mdi-menu</v-icon>
                </v-btn>
            </div>

            <v-divider />

            <portal-tenant-organization-switch v-if="!user?.isSaasAdmin" :is-collapsed="isCollapsed"></portal-tenant-organization-switch>

            <v-list color="primary" base-color="white" nav>
                <v-list-item rounded="xl" prepend-icon="mdi-view-dashboard" title="Tableau de bord" to="/portal/dashboard" />

                <v-list-subheader
                    v-if="user?.isSaasAdmin"
                    class="mt-2 text-uppercase text-label-large"
                    color="grey-lighten-2"
                >
                    Pilotage SaaS
                </v-list-subheader>

                <v-list-item
                    v-if="user?.isSaasAdmin"
                    rounded="xl"
                    prepend-icon="mdi-message-processing-outline"
                    title="Formulaire de contact"
                    to="/portal/contacts"
                ></v-list-item>

                <v-list-item
                    v-if="user?.isSaasAdmin"
                    rounded="xl"
                    prepend-icon="mdi-file-code-outline"
                    title="Pages"
                    to="/portal/pages"
                ></v-list-item>

                <v-list-item
                    v-if="user?.isSaasAdmin"
                    rounded="xl"
                    prepend-icon="mdi-menu"
                    title="Menus"
                    to="/portal/menus"
                ></v-list-item>

                <v-list-item
                    v-if="user?.isSaasAdmin"
                    rounded="xl"
                    prepend-icon="mdi-cube-outline"
                    title="Abonnements"
                    to="/portal/plans"
                ></v-list-item>

                <v-list-item
                    v-if="user?.isSaasAdmin"
                    rounded="xl"
                    prepend-icon="mdi-file-tree"
                    title="Jobs"
                    to="/portal/jobs"
                ></v-list-item>

                <v-list-subheader
                    v-if="!user?.isSaasAdmin && currentOrganization?.slug"
                    class="mt-2 text-uppercase text-label-large"
                    color="grey-lighten-2"
                >
                    Configuration
                </v-list-subheader>

                <v-list-item
                    v-if="!user?.isSaasAdmin && currentOrganization?.slug"
                    rounded="xl"
                    prepend-icon="mdi-account-group"
                    title="Membres"
                    :to="`/portal/${currentOrganization?.slug}/members`"
                ></v-list-item>

                <v-list-item
                    v-if="!user?.isSaasAdmin && currentOrganization?.slug"
                    rounded="xl"
                    prepend-icon="mdi-cog"
                    title="Paramètres"
                    :to="`/portal/${currentOrganization?.slug}/settings`"
                ></v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar height="82" color="navbar">
            <v-app-bar-title class="font-weight-black">
                {{ pageTitle }}
            </v-app-bar-title>

            <v-spacer></v-spacer>

            <notifications-bell></notifications-bell>

            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn :height="56" :min-width="0" variant="tonal" rounded="lg" class="mr-4 px-3" v-bind="props">
                        <v-avatar size="34" class="gradient-primary mr-2" rounded="0">
                            {{ userInitials }}
                        </v-avatar>

                        <div class="text-left">
                            <div class="text-body-2 font-weight-bold">
                                {{ userName }}
                            </div>
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

        <v-navigation-drawer v-model="notifOpen" location="right" temporary width="600" class="notif-drawer">
            <transition name="notif-content">
                <notifications-panel v-if="notifOpen"></notifications-panel>
            </transition>
        </v-navigation-drawer>

        <v-main>
            <v-container fluid>
                <slot />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { OrganizationMemberRoleLabel } from "~/models/OrganizationMember";

const notifOpen = useState("notif:drawer:open", () => false);

const { menuIsOpen, toggleMenu } = useUserPreferences();
const { user, logout, currentOrganization } = useAuth();
const { connect, disconnect } = useNotifications();

// SSE parts, important to keep for notification system.
onMounted(() => connect());
onUnmounted(() => disconnect());

const pageTitle = useState("pageTitle");

const route = useRoute();
const router = useRouter();

onMounted(async () => {
    if (typeof route.query.token !== "string" && typeof route.query.refreshToken !== "string") {
        return;
    }

    const query = { ...route.query };
    delete query.token;
    delete query.refreshToken;

    await router.replace({ query });
});

const isHovering = ref(false);
const isCollapsed = computed(() => menuIsOpen.value && !isHovering.value);

const userInitials = computed(() => {
    if (!user.value) {
        return "?";
    }

    const f = user.value.firstname?.[0] ?? "";
    const l = user.value.lastname?.[0] ?? "";

    return (f + l).toUpperCase() || user.value.email[0].toUpperCase();
});

const userName = computed(() => {
    if (!user.value) {
        return "";
    }

    const parts = [user.value.firstname, user.value.lastname ? `${user.value.lastname[0]}.` : null].filter(Boolean);

    return parts.length ? parts.join(" ") : user.value.email;
});

const userRole = computed(() => {
    if (!user.value) {
        return "";
    }

    if (user.value.isSaasAdmin) {
        return "Propriétaire";
    }

    if (currentOrganization.value?.role) {
        return OrganizationMemberRoleLabel[currentOrganization.value.role];
    }

    return "";
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

:deep(.v-navigation-drawer.main-nav) {
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    z-index: 999 !important;
}

:deep(.notif-drawer) {
    transition: transform 0.35s cubic-bezier(0.34, 1.1, 0.64, 1) !important;
}

:deep(.v-app-bar) {
    transition:
        left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
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
    content: "";
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
