<template>
    <v-row>
        <v-col md="12">
            <v-card rounded="lg" border flat>
                <v-card-text>
                    <v-row>
                        <v-col md="3">
                            <v-text-field
                                variant="outlined"
                                density="compact"
                                label="Nom / Prénom"
                            ></v-text-field>
                        </v-col>

                        <v-col md="3">
                            <v-text-field
                                variant="outlined"
                                density="compact"
                                label="Rôle"
                            ></v-text-field>
                        </v-col>

                        <v-col md="2">
                            <v-btn
                                class="mt-n1"
                                color="blue"
                                variant="tonal"
                                rounded="lg"
                                prepend-icon="mdi-magnify"
                                block
                                size="large"
                            >
                                Rechercher
                            </v-btn>
                        </v-col>

                        <v-col md="1" offset-md="3" v-if="canInvite">
                            <portal-tenant-members-invite
                            ></portal-tenant-members-invite>
                        </v-col>

                        <v-col md="12">
                            <v-divider class="mt-n8"></v-divider>

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
                                            {{ memberInitials(item.member) }}
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
    members.value = await api.get<Array<OrganizationMember>>(`/${slugOrganization}/members`, {
        loadingKey: "members:list",
    });
});

const memberInitials = (user: User): string => {
    const f = user.firstname?.[0] ?? "";
    const l = user.lastname?.[0] ?? "";

    return (f + l).toUpperCase() || (user.email?.[0] ?? "?").toUpperCase();
};

const removeToMembers = (data: OrganizationMember) => {
    members.value = members.value.filter((member) => member.uuid !== data.uuid);
}
</script>