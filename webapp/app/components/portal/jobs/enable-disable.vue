<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading" v-if="props.entity.isRegistered">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                :color="props.entity.isEnabled ? 'error' : 'success'"
                icon
            >
                <v-icon v-if="props.entity.isEnabled">mdi-sync-off</v-icon>
                <v-icon v-else>mdi-sync</v-icon>
            </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="isLoading">
                <v-toolbar :color="props.entity.isEnabled ? 'error' : 'success'">
                    <v-toolbar-title>
                        <span v-if="props.entity.isEnabled">Désactiver le job</span>
                        <span v-else>Activer le job</span>
                    </v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row>
                        <v-col md="12" v-if="props.entity.isEnabled">
                            <v-alert type="info">Vous êtes sur le point de désactivé le job.</v-alert>

                            <br />

                            <p>
                                Ce job est <strong>actuellement activé</strong> et <strong>tourne</strong> sur le serveur.<br /><br />
                                Vous êtes sur le point de le désactivé, ce qui fait qu'il <strong>ne tournera plus jusqu'au moment ou il sera de nouveau activé</strong>.<br /><br />
                                Êtes-vous sur de vouloir réaliser cette action ?
                            </p>
                        </v-col>

                        <v-col md="12" v-else>
                            <v-alert type="info">Vous êtes sur le point d'activé le job.</v-alert>

                            <br />

                            <p>
                                Ce job est <strong>actuellement désactivé</strong> et <strong>ne tourne pas</strong> sur le serveur.<br /><br />
                                Vous êtes sur le point de le réactivé, ce qui fait qu'il <strong>va tourner a chaque période définie</strong>.<br /><br />
                                Êtes-vous sur de vouloir réaliser cette action ?
                            </p>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        @click="handleUpdate"
                    >Continuer</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { JobSetting } from '~/models/JobSetting';

const props = defineProps<{
    entity: JobSetting,
}>();

const emit = defineEmits(['updated']);

const api = useApi();
const dialog = ref(false);

const isLoading = computed(() => {
    return api.isLoading('KEY');
});

const handleClose = () => {
    dialog.value = false;
}

const handleUpdate = async () => {
    const res = await api.put<{message: string, entity: JobSetting}>(
        `job/${props.entity.uuid}`,
        { isEnabled: !props.entity.isEnabled },
        { loadingKey: 'jobs:edit', toast: true }
    );

    emit('updated', res.entity);
    handleClose();
};
</script>