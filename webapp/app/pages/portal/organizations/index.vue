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
                            <div class="d-flex align-center ga-3 py-2">
                                <v-avatar size="36" rounded="lg" class="gradient-primary flex-shrink-0">
                                    {{ organizationInitials(item.name) }}
                                </v-avatar>

                                <div>
                                    <div class="text-body-2 font-weight-medium">{{ item.name }}</div>
                                    <div class="text-caption text-medium-emphasis">Organisation</div>
                                </div>
                            </div>
                        </template>

                        <template v-slot:item.slug="{ item }">
                            <v-chip color="primary" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-pound">
                                {{ item.slug }}
                            </v-chip>
                        </template>

                        <template v-slot:item.ownerName="{ item }">
                            <v-chip color="secondary" variant="outlined" size="small" rounded="lg" prepend-icon="mdi-account-star">
                                {{ ownerName(item) }}
                            </v-chip>
                        </template>

                        <template v-slot:item.membersCount="{ item }">
                            <v-chip
                                :color="item.members.length >= 10 ? 'success' : 'info'"
                                variant="tonal"
                                size="small"
                                rounded="lg"
                                prepend-icon="mdi-account-group"
                            >
                                {{ item.members.length }} {{ item.members.length > 1 ? "membres" : "membre" }}
                            </v-chip>
                        </template>

                        <template v-slot:item.country="{ item }">
                            <v-chip color="grey" variant="outlined" size="small" rounded="lg" prepend-icon="mdi-earth">
                                {{ item.country || "Non renseigné" }}
                            </v-chip>
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <div class="d-flex justify-end ga-2">
                                <v-btn :to="`/portal/${item.slug}/settings`" icon="mdi-cog-outline" variant="flat" size="small"></v-btn>
                            </div>
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
    { title: "Propriétaire", key: "ownerName" },
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
    return owner ? `${owner.member.firstname} ${owner.member.lastname}` : "N/A";
};

const organizationInitials = (name: string): string => {
    if (!name) {
        return "N/A";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
};
</script>
