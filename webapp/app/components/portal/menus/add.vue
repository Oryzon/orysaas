<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="flat"
                color="primary"
                prepend-icon="mdi-plus"
            >
                Créer
            </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="isLoading">
                <v-toolbar color="primary">
                    <v-toolbar-title>Création d'un menu</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form
                        ref="form"
                        v-model="isFormValid"
                    >
                        <v-row>
                            <v-col md="12">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Clé"
                                    v-model="menu.key"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required(), rules.minLength(3)]"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Label"
                                    v-model="menu.label"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required(), rules.minLength(3)]"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12" class="mt-n6">
                                <v-switch
                                    label="Menu actif ?"
                                    inset="square"
                                    color="success"
                                    v-model="menu.isActive"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-switch>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n12" >
                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        @click="handleCreate"
                        :disabled="!isFormValid"
                    >Créer</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import { type Menu } from "~/models/Menu";

const api = useApi();
const dialog = ref(false);

const emit = defineEmits(['created']);

const isLoading = computed(() => {
    return api.isLoading('menu:create');
});

const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
let menu = ref<Partial<Menu>>({});

const handleClose = () => {
    dialog.value = false;
    menu.value = {};
}

const handleCreate = async () => {
    const { valid } = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    let res = await api.post<{ message: string, entity: Menu }>(`/menu`,
        { ...menu.value },
        {
            loadingKey: 'menu:create',
            toast: true
        });

    emit("created", res.entity);
    handleClose();
}
</script>