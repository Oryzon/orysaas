<template>

</template>

<script setup lang="ts">
const api = useApi();

useConfigPage('Tableau de bord');

definePageMeta({
    layout: 'portal',
    middleware: 'auth',
});
</script>