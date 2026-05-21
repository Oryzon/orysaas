<template>
    <v-dialog v-model="dialog" max-width="600">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" variant="text" icon color="error">
                <v-icon>mdi-trash-can</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="error" dark>
                    <v-toolbar-title>Supprimer "{{ entity.title }}"</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <p>Êtes-vous sûr de vouloir supprimer ce plan ?</p>
                    <p class="text-caption">Cette action est irréversible.</p>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-spacer />

                    <v-btn color="error" variant="flat" :disabled="isLoading" @click="handleDelete"> Supprimer </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { Plan } from "~/models/Plan";

const props = defineProps<{
    entity: Plan;
}>();

const emit = defineEmits(["deleted"]);

const api = useApi();

const dialog = ref(false);

const plan = ref<Partial<Plan>>({});

watch(dialog, async (newVal) => {
    plan.value = { ...props.entity };
});

const isLoading = computed(() => api.isLoading("plans:delete"));

const handleClose = () => {
    dialog.value = false;
};

const handleDelete = async () => {
    await api.remove(`plan/${plan.value.uuid}`, {
        toast: true,
        loadingKey: "plans:delete",
    });

    emit("deleted", plan.value.uuid);
    handleClose();
};
</script>
