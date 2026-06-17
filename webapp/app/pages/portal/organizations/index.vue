<template>
    <v-row>
        <v-col md="12">
            <v-card flat>
                <v-card-text>
                    <v-data-table
                        :headers="headers"
                        :items="organizations"
                        :loading="isLoading"
                        loading-text="Chargement des organisations en cours."
                        no-data-text="Il n'y a pas d'organisation."
                        items-per-page="25"
                    >
                        <template v-slot:item.name="{ item }">
                            <v-list lines="two" class="ml-n4">
                                <v-list-item>
                                    <template v-slot:prepend>
                                        <v-avatar size="48" rounded="lg" class="gradient-primary flex-shrink-0">
                                            <v-img v-if="item?.logoUrl" :src="item.logoUrl!" :alt="item.name ?? ''" cover />
                                            <span v-else>{{ getInitials(item.name) }}</span>
                                        </v-avatar>
                                    </template>

                                    <v-list-item-title>{{ item.name }}</v-list-item-title>

                                    <v-list-item-subtitle class="text-label-large">
                                        Propriétaire : {{ ownerName(item) }}
                                    </v-list-item-subtitle>
                                </v-list-item>
                            </v-list>
                        </template>

                        <template v-slot:item.slug="{ item }">
                            <v-chip
                                color="primary"
                                variant="tonal"
                                prepend-icon="mdi-pound"
                            >
                                {{ item.slug }}
                            </v-chip>
                        </template>

                        <template v-slot:item.membersCount="{ item }">
                            <v-chip
                                :color="item.members.length >= 10 ? 'success' : 'info'"
                                variant="tonal"
                                prepend-icon="mdi-account-group"
                            >
                                {{ item.members.length }} {{ item.members.length > 1 ? "membres" : "membre" }}
                            </v-chip>
                        </template>

                        <template v-slot:item.actions="{ item }">
                                <v-btn
                                    variant="text"
                                    icon
                                    color="info"
                                    :to="`/portal/organizations/${item.slug}`"
                                >
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import { type Organization } from "~/models/Organization";
const api = useApi();

useConfigPage("Organisations");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const isLoading = computed(() => {
    return api.isLoading("organizations:list");
});

const headers = [
    { title: "Nom", key: "name" },
    { title: "Slug", key: "slug" },
    { title: "Nombre de membres", key: "membersCount" },
    { title: "Pays", key: "country" },
    { title: "Actions", key: "actions", sortable: false, align: "end" },
];

const organizations = ref<Organization[]>([]);

// Init of the page
onMounted(async () => {
    await handleSearch();
});

const handleSearch = async () => {
    organizations.value = await api.get<Organization[]>("organizations", {
        loadingKey: "organizations:list",
    });
};

const ownerName = (org: Organization) => {
    const owner = org.members.find((member) => member.role === "owner");
    return owner ? `${owner.member.firstname} ${owner.member.lastname}` : "N.R";
};
</script>
