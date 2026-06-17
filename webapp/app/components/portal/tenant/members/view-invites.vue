<template>
    <v-dialog v-model="dialog" max-width="640" :persistent="isLoading">
        <template #activator="{ props: activatorProps }">
            <v-btn
                prepend-icon="mdi-email-fast-outline"
                variant="tonal"
                color="primary"
                v-bind="activatorProps"
            >
                Voir invitations
            </v-btn>
        </template>

        <v-card flat>
            <v-toolbar color="primary" flat>
                <v-toolbar-title class="d-flex align-center ga-3">
                    <v-icon>mdi-email-fast-outline</v-icon>&nbsp;
                    Invitations en attente
                </v-toolbar-title>

                <v-btn icon @click="dialog = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text class="pa-0">
                <div v-if="isLoading" class="pa-6 d-flex justify-center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>

                <div
                    v-else-if="invites.length === 0"
                    class="pa-8 text-center text-medium-emphasis"
                >
                    Il n'y a aucune invitation en attente.
                </div>

                <v-list v-else lines="two">
                    <template v-for="(invite, index) in invites" :key="invite.uuid">
                        <v-list-item>
                            <template #prepend>
                                <v-avatar
                                    size="36"
                                    rounded="lg"
                                    class="mr-3 text-caption font-weight-bold flex-shrink-0"
                                    :color="OrganizationMemberRoleColor[invite.role as OrganizationMemberRole] ?? 'grey'"
                                >
                                    {{ OrganizationMemberRoleLabel[invite.role as OrganizationMemberRole]?.charAt(0).toUpperCase() ?? '?' }}
                                </v-avatar>
                            </template>

                            <v-list-item-title class="text-body-2 font-weight-medium">
                                {{ invite.email }}
                            </v-list-item-title>

                            <v-list-item-subtitle class="text-caption mt-1">
                                Expire le {{ $date.french(invite.expiresAt) }}
                            </v-list-item-subtitle>

                            <template #append>
                                <v-btn
                                    v-if="!adminMode"
                                    icon
                                    size="small"
                                    variant="text"
                                    color="error"
                                    :loading="cancellingUuid === invite.uuid"
                                    @click="handleCancel(invite)"
                                >
                                    <v-icon size="18">mdi-close</v-icon>
                                </v-btn>
                            </template>
                        </v-list-item>

                        <v-divider v-if="index < invites.length - 1" inset></v-divider>
                    </template>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import type { OrganizationInvite } from "~/models/OrganizationInvite";
import { OrganizationMemberRoleLabel, OrganizationMemberRoleColor } from "~/models/OrganizationMember";
import type { OrganizationMemberRole } from "~/models/OrganizationMember";

const props = defineProps<{
    slug: string;
    adminMode?: boolean;
}>();

const api = useApi();
const dialog = ref(false);
const invites = ref<OrganizationInvite[]>([]);
const cancellingUuid = ref<string | null>(null);

const isLoading = computed(() => api.isLoading('invites:list'));

const listEndpoint = computed(() =>
    props.adminMode
        ? `/organization/${props.slug}/invites`
        : `/tenant/${props.slug}/member/invite/pending`
);

watch(dialog, async (opened) => {
    if (!opened) {
        return;
    }

    invites.value = await api.get<OrganizationInvite[]>(listEndpoint.value, {
        loadingKey: 'invites:list',
        toast: false,
    });
});

const handleCancel = async (invite: OrganizationInvite) => {
    cancellingUuid.value = invite.uuid;

    try {
        await api.remove(`/tenant/${props.slug}/member/invite/${invite.uuid}`, {
            toast: true,
        });

        invites.value = invites.value.filter(i => i.uuid !== invite.uuid);
    } finally {
        cancellingUuid.value = null;
    }
};
</script>