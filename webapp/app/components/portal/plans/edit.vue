<template>
    <v-btn variant="text" icon color="info" @click="redirectToEdition">
        <v-icon>mdi-pencil</v-icon>
    </v-btn>
</template>
<script lang="ts" setup>
import type { Plan } from "~/models/Plan";

const props = defineProps<{
    entity: Plan;
}>();

const redirectToEdition = async () => {
    await navigateTo(`/portal/plans/${props.entity.uuid}`);
};
</script>
