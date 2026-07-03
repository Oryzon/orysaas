<template>
    <div class="org-switcher" :class="{ 'org-switcher-collapsed': props.isCollapsed }" @click="dialogSwitchOrga = !dialogSwitchOrga">
        <v-avatar
            size="36"
            rounded="lg"
            class="flex-shrink-0"
            :class="{ 'gradient-primary': !currentOrganization?.logoUrl, 'bg-white': !!currentOrganization?.logoUrl }"
        >
            <v-img v-if="currentOrganization?.logoUrl" :src="currentOrganization.logoUrl!" :alt="currentOrganization.name ?? ''" cover />
            <span v-else>{{ getInitials(currentOrganization?.name) }}</span>
        </v-avatar>

        <transition name="org-content">
            <div v-if="!props.isCollapsed" class="org-info">
                <div class="org-name">{{ currentOrganization?.name ?? "Aucune organisation" }}</div>
                <div class="org-sub" v-if="currentOrganization?.name">{{ currentOrganization?.nbMembers ?? 0 }} utilisateurs</div>
            </div>
        </transition>

        <transition name="org-content">
            <v-icon v-if="!props.isCollapsed" class="org-chevron" size="18">mdi-unfold-more-horizontal</v-icon>
        </transition>
    </div>

    <v-dialog v-model="dialogSwitchOrga" max-width="600" :persistent="isLoading">
        <v-card flat>
            <v-toolbar color="primary">
                <v-toolbar-title>
                    <v-icon>mdi-swap-horizontal</v-icon>

                    Changer d'organisation
                </v-toolbar-title>

                <v-toolbar-items>
                    <v-btn @click="handleClose">
                        <v-icon color="white">mdi-close</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text>
                <v-row>
                    <v-col md="12">
                        <v-card
                            v-for="organization in organizations"
                            :color="organization.slug === currentOrganization?.slug ? 'success' : ''"
                            variant="outlined"
                            class="mb-2"
                            rounded="lg"
                            flat
                            @click="handleChangeOrganization(organization.uuid)"
                        >
                            <v-card-text>
                                <v-row justify="center" align="center" class="mt-n4 mb-n4">
                                    <v-col md="2">
                                        <v-avatar
                                            size="48"
                                            rounded="lg"
                                            class="flex-shrink-0 mt-n2 mb-n2"
                                            :class="{ 'gradient-primary': !organization?.logoUrl, 'bg-white': !!organization?.logoUrl }"
                                        >
                                            <v-img
                                                v-if="organization?.logoUrl"
                                                :src="organization.logoUrl!"
                                                :alt="organization.name ?? ''"
                                                cover
                                            />

                                            <span v-else>{{ getInitials(organization.name) }}</span>
                                        </v-avatar>
                                    </v-col>

                                    <v-col md="10">
                                        <h2 class="mt-2">{{ organization.name }}</h2>
                                        <p class="mt-n4">
                                            {{ organization.nbMembers }} utilisateur{{ (organization.nbMembers ?? 0) > 1 ? "s" : "" }}
                                        </p>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>

                        <portal-tenant-organization-create is-simple-button @created="addToOrganizations" />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { Organization } from "~/models/Organization";

const props = defineProps<{ isCollapsed: boolean }>();

const { currentOrganization } = useAuth();
const router = useRouter();


// Switch Orga Mod
const api = useApi();
let dialogSwitchOrga = ref(false);
const isLoading = computed(() => api.isLoading("organizations:load"));
let organizations = ref<Array<Organization>>([]);

const handleClose = () => {
    dialogSwitchOrga.value = false;
};

watch(dialogSwitchOrga, async (newVal) => {
    if (newVal) {
        organizations.value = await api.get<Array<Organization>>(`/user/organizations`, {
            loadingKey: "organizations:load",
            toast: false,
        });
    }
});

const addToOrganizations = (data: Organization) => {
    organizations.value.push(data);

    handleChangeOrganization(data.uuid);
};

const handleChangeOrganization = async (uuid: string) => {
    const org = organizations.value.find((o) => o.uuid === uuid);

    if (!org || org.slug === currentOrganization.value?.slug) {
        dialogSwitchOrga.value = false;
        return;
    }

    currentOrganization.value = {
        slug: org.slug,
        name: org.name,
        logoUrl: org.logoUrl,
        nbMembers: org.nbMembers ?? 0,
        role: org.role as any,
    };

    dialogSwitchOrga.value = false;
    await router.replace("/portal/dashboard");
};
</script>

<style scoped>
.org-switcher {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 12px;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    cursor: pointer;
    transition:
        background 0.2s ease,
        padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        margin 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.3s ease;
    color: white;
}

.org-switcher:hover {
    background: rgba(255, 255, 255, 0.06);
}

.org-info {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
}

.org-name {
    font-weight: 700;
    font-size: 0.875rem;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
}

.org-sub {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.45);
}

.org-chevron {
    color: rgba(255, 255, 255, 0.45) !important;
    flex-shrink: 0;
}

.org-switcher-collapsed {
    justify-content: center;
    padding: 8px;
    margin: 12px 6px;
    gap: 0;
    border-color: transparent;
}

.org-content-leave-active {
    transition: opacity 0.15s ease;
}

.org-content-enter-active {
    transition: opacity 0.2s ease 0.18s;
}

.org-content-enter-from,
.org-content-leave-to {
    opacity: 0;
}
</style>
