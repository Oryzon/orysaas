<template>
    <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" variant="tonal" color="secondary" prepend-icon="mdi-tune-variant" class="text-none">
                Gestion des quotas
            </v-btn>
        </template>
        <template v-slot:default>
            <v-card> </v-card>
        </template>
    </v-dialog>
</template>
<script setup lang="ts">
import type { Plan } from "~/models/Plan";

const props = defineProps<{
    entity: Plan;
}>();

const emit = defineEmits(["deleted"]);

const api = useApi();

const dialog = ref(false);

const plan = ref<Partial<Plan>>({});
</script>
