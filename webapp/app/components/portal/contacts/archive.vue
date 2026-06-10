<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                icon
                variant="text"
                color="error"
                v-bind="activatorProps"
            >
                <v-icon>mdi-archive</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card flat>
                <v-toolbar color="error">
                    <v-toolbar-title>Archive le message</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose" :disabled="isLoading">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <p>Vous êtes sur le point d'archiver le message de <strong>{{ entity?.lastname }} {{ entity?.firstname }}</strong>.</p>
                            <p>Ce message a été reçu le {{ $date.french(props.entity?.createdAt) }} et avait en sujet <strong>"{{ entity?.subject }}"</strong>.</p>
                            <p>Êtes-vous sur de vouloir continuer cette opération ?</p>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-btn
                        color="error"
                        variant="flat"
                        @click="handleRemove"
                        :loading="isLoading"
                        :disabled="isLoading"
                    >
                        Confirmer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { Contact } from "~/models/Contact";

const props = defineProps<{
    entity: Contact;
}>();

const emit = defineEmits(['archived']);

const api = useApi();
const route = useRoute();

const dialog = ref(false);
const isLoading = computed(() => api.isLoading("contact:archive"));

const handleClose = () => {
    dialog.value = false;
};

const handleRemove = async () => {
    const res = await api.remove<{ message: string, entity: Contact}>(
        `/contact/${props?.entity?.uuid}`,
        {
            loadingKey: "contact:archive",
            toast: true,
        },
    );

    if (res?.entity) {
        emit("archived", res.entity);
        handleClose();
    }
};
</script>