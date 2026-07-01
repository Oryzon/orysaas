<template>
    <v-dialog v-model="dialog" max-width="800" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                color="info"
                icon
            >
                <v-icon>mdi-eye</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="info">
                    <v-toolbar-title>Voir la clé d'API <strong>{{ entity.label }}</strong></v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <blockquote style="font-family: monospace;">{{ decrypted }}</blockquote>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { ApiKey } from "~/models/ApiKey";

const props = defineProps<{
    entity: ApiKey;
}>();

const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;

const api = useApi();
const dialog = ref(false);

const isLoading = computed(() => api.isLoading('api-key:decrypted'));
const decrypted = ref();

const handleClose = () => {
    dialog.value = false;
    decrypted.value = '';
};

watch(dialog, async (newVal) => {
    if (newVal) {
        decrypted.value = await api.get<string>(`/tenant/${slugOrganization}/setting/api-key/${props.entity.uuid}`, {
            loadingKey: 'api-key:decrypted'
        });
    }
});
</script>