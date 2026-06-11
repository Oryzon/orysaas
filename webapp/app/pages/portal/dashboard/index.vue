<template>
    <div class="dashboard-page-shell">
        <portal-tenant-organization-onboarding-dashboard v-if="hasOrganization" />

        <div v-else>
            <v-card rounded="xl" class="py-5 mt-5 mx-10 text-center">
                <h2 class="text-h5 font-weight-bold">Voici votre espace</h2>
                <p class="text-body-1 mt-3">Cette page est dédié à un certain affichage</p>
            </v-card>
        </div>
    </div>
</template>

<script setup lang="ts">
const { hasOrganization } = useAuth();

useConfigPage("Tableau de bord");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});
</script>
