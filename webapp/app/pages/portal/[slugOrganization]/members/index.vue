<template>
    <v-row>
        <v-col md="12" class="d-flex justify-end ga-2 mb-n2">
            <portal-tenant-members-view-invites
                :slug="slugOrganization"
            ></portal-tenant-members-view-invites>

            <portal-tenant-members-invite></portal-tenant-members-invite>
        </v-col>

        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-data-table
                                :headers="headers"
                                :items="members"
                                :loading="isLoading"
                                loading-text="Chargement des membres..."
                                no-data-text="Aucun membre pour le moment."
                                hide-default-footer
                                striped="even"
                            >
                                <template v-slot:item.member="{ item }">
                                    <div class="d-flex align-center ga-3 py-2">
                                        <v-avatar size="36" rounded="lg" class="gradient-primary flex-shrink-0">
                                            {{ getInitials(item.member.firstname + ' ' + item.member.lastname) }}
                                        </v-avatar>

                                        <div>
                                            <div class="text-body-2 font-weight-medium">{{ item.member.lastname }}
                                                {{ item.member.firstname }}
                                            </div>
                                            <div class="text-caption text-medium-emphasis">{{ item.member.email }}</div>
                                        </div>
                                    </div>
                                </template>

                                <template v-slot:item.role="{ value }">
                                    <v-chip
                                        :color="OrganizationMemberRoleColor[value as OrganizationMemberRole] ?? 'grey'"
                                        variant="tonal"
                                        size="small"
                                        rounded="lg"
                                    >
                                        {{ OrganizationMemberRoleLabel[value as OrganizationMemberRole] ?? value }}
                                    </v-chip>
                                </template>

                                <template v-slot:item.createdAt="{ item }">
                                    <span class="text-body-2 text-medium-emphasis">{{ $date.french(item.createdAt) }}</span>
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <portal-tenant-members-edit
                                        v-if="canEdit && item.role !== OrganizationMemberRole.OWNER"
                                        :entity="item"
                                    ></portal-tenant-members-edit>

                                    <portal-tenant-members-remove
                                        v-if="canDelete && item.role !== OrganizationMemberRole.OWNER"
                                        :entity="item"
                                        @removed="removeToMembers"
                                    ></portal-tenant-members-remove>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import {
    type OrganizationMember,
    OrganizationMemberRole,
    OrganizationMemberRoleColor,
    OrganizationMemberRoleLabel
} from "~/models/OrganizationMember";
import type { User } from "~/models/User";

useConfigPage("Membres");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const api = useApi();
const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;

const members = ref<Array<OrganizationMember>>([]);
const isLoading = computed(() => api.isLoading("members:list"));

const canInvite = useOrganizationCan(OrganizationMemberRole.ADMIN);
const canEdit = useOrganizationCan(OrganizationMemberRole.ADMIN);
const canDelete = useOrganizationCan(OrganizationMemberRole.ADMIN);

const headers = computed(() => {
    let headers = [
        { title: "Utilisateur", key: "member", sortable: false },
        { title: "Rôle", key: "role", sortable: false },
        { title: "Membre depuis", key: "createdAt" },

    ];

    if (canEdit.value || canDelete.value) {
        headers.push({ title: "Actions", key: "actions", sortable: false, align: "end" as const });
    }

    return headers;
});

onMounted(async () => {
    members.value = await api.get<Array<OrganizationMember>>(`/tenant/${slugOrganization}/members`, {
        loadingKey: "members:list",
    });
});

const removeToMembers = (data: OrganizationMember) => {
    members.value = members.value.filter((member) => member.uuid !== data.uuid);
}
</script>