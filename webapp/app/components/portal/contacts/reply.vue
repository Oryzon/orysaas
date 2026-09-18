<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn icon="mdi-reply" variant="text" color="primary" v-bind="activatorProps"></v-btn>
        </template>

        <template v-slot:default>
            <v-card flat>
                <v-toolbar color="primary">
                    <v-toolbar-title>Répondre à {{ entity?.firstname }} {{ entity?.lastname }}</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose" :disabled="isLoading">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <p class="text-body-2 text-medium-emphasis">
                                Message reçu le {{ $date.french(entity?.createdAt) }} — sujet :
                                <strong>{{ entity?.subject }}</strong>
                            </p>
                            <p class="text-body-2" style="white-space: pre-wrap">{{ entity?.message }}</p>
                        </v-col>

                        <v-col md="12">
                            <v-textarea
                                v-model="message"
                                label="Votre réponse"
                                rows="6"
                                variant="outlined"
                                :disabled="isLoading"
                            ></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-btn
                        color="primary"
                        variant="flat"
                        @click="handleSend"
                        :loading="isLoading"
                        :disabled="isLoading || !message"
                    >
                        Envoyer la réponse
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

const emit = defineEmits(["replied"]);

const api = useApi();

const dialog = ref(false);
const message = ref("");
const isLoading = computed(() => api.isLoading("contact:reply"));

const handleClose = () => {
    dialog.value = false;
};

const handleSend = async () => {
    const res = await api.post<{ message: string }>(
        `/contact/${props.entity.uuid}/reply`,
        { message: message.value },
        {
            loadingKey: "contact:reply",
            toast: true,
        },
    );

    if (res) {
        emit("replied", props.entity);
        message.value = "";
        handleClose();
    }
};
</script>
