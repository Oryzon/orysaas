<template>
    <portal-dashboard-saas-admin v-if="user?.isSaasAdmin" />
    <portal-dashboard-tenant-user v-else />
</template>

<script setup lang="ts">
const { user } = useAuth();

useConfigPage("Tableau de bord");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});
</script>
