<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                icon
                variant="text"
                color="error"
                v-bind="activatorProps"
            >
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card flat>
                <v-toolbar color="error">
                    <v-toolbar-title>Retirer le membre</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose" :disabled="isLoading">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-alert type="info">Cette opération est une opération définitive.</v-alert>

                            <p>Vous êtes sur le point de retirer <strong>{{ props.entity?.member?.lastname }} {{ props.entity?.member?.firstname }}</strong> de cette organisation.</p>
                            <p>L'utilisateur a été ajouté le {{ $date.french(props.entity?.createdAt) }}.</p>
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
import type { OrganizationMember } from "~/models/OrganizationMember";

const props = defineProps<{
    entity: OrganizationMember;
}>();

const emit = defineEmits(['removed']);

const api = useApi();
const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;

const dialog = ref(false);
const isLoading = computed(() => api.isLoading("member:remove"));

const handleClose = () => {
    dialog.value = false;
};

const handleRemove = async () => {
    const res = await api.remove<{ message: string, entity: OrganizationMember}>(
        `/tenant/${slugOrganization}/member/${props.entity.uuid}`,
        {
            loadingKey: "member:remove",
            toast: true,
        },
    );

    if (res?.entity) {
        emit("removed", res.entity);
        handleClose();
    }
};
</script>