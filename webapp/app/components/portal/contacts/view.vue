<template>
    <v-dialog v-model="dialog" max-width="1200" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                icon
                variant="text"
                color="info"
                v-bind="activatorProps"
            >
                <v-icon>mdi-eye</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card flat>
                <v-toolbar color="info">
                    <v-toolbar-title>Voir le message</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose" :disabled="isLoading">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row>
                        <v-col md="4">
                            <v-text-field
                                label="Nom"
                                v-model="entity.lastname"
                                readonly
                                variant="outlined"
                            ></v-text-field>
                        </v-col>

                        <v-col md="4">
                            <v-text-field
                                label="Prénom"
                                v-model="entity.firstname"
                                readonly
                                variant="outlined"
                            ></v-text-field>
                        </v-col>

                        <v-col md="4">
                            <v-text-field
                                label="Société"
                                readonly
                                v-model="entity.company"
                                variant="outlined"
                            ></v-text-field>
                        </v-col>

                        <v-col md="12" class="mt-n8">
                            <v-text-field
                                label="Email"
                                readonly
                                v-model="entity.email"
                                variant="outlined"
                            ></v-text-field>
                        </v-col>

                        <v-col md="12" class="mt-n8">
                            <v-text-field
                                label="Sujet"
                                readonly
                                v-model="entity.subject"
                                variant="outlined"
                            ></v-text-field>
                        </v-col>

                        <v-col md="12" class="mt-n8">
                            <v-textarea
                                label="Message"
                                readonly
                                v-model="entity.message"
                                variant="outlined"
                                rows="20"
                            ></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>
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
</script>