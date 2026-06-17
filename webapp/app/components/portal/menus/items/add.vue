<template>
    <v-dialog v-model="dialog" max-width="800" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                v-bind="activatorProps"
                variant="text"
                color="dark"
                prepend-icon="mdi-plus"
            >
                Créer
            </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="isLoading">
                <v-toolbar>
                    <v-toolbar-title>Création d'un élément de menu</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="error">mdi-close</v-icon>
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
                                <v-select
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Parent"
                                    v-model="menuItem.parentUuid"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :items="formatedAvailableParents"
                                    clearable
                                ></v-select>
                            </v-col>

                            <v-col md="6" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Label"
                                    v-model="menuItem.label"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                ></v-text-field>
                            </v-col>

                            <v-col md="6" class="mt-n4">
                                <v-select
                                    hide-details="auto"
                                    variant="outlined"
                                    label="Cible"
                                    v-model="menuItem.target"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                    :rules="[ rules.required() ]"
                                    :items="targets"
                                ></v-select>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-text-field
                                    hide-details="auto"
                                    variant="outlined"
                                    label="URL"
                                    v-model="menuItem.url"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                >
                                    <template v-slot:append-inner>
                                        <portal-pages-search-for-menu
                                            @selected="(data) => menuItem.url = data"
                                        ></portal-pages-search-for-menu>
                                    </template>
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n4">
                    <v-switch
                        label="Est visible ?"
                        inset="square"
                        hide-details
                        density="compact"
                        color="success"
                        v-model="menuItem.isVisible"
                        :loading="isLoading"
                        :disabled="isLoading"
                    ></v-switch>

                    <v-spacer></v-spacer>

                    <v-btn
                        color="success"
                        variant="flat"
                        @click="handleCreate"
                        :disabled="!isFormValid || isLoading"
                        :loading="isLoading"
                    >Créer</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import { targets, type MenuItem, buildMenuTree, flattenMenuTreeForSelect } from "~/models/MenuItem";

const api = useApi();
const dialog = ref(false);

const emit = defineEmits(['created']);

const isLoading = computed(() => {
    return api.isLoading('menu-item:create') || api.isLoading('menu-item:parents');
});

const form = ref();
const isFormValid = ref(false);
const rules = useValidationRules();
const route = useRouter().currentRoute.value;

let menuItem = ref<Partial<MenuItem>>({});
let availableParents = ref<Array<MenuItem>>([]);

watch(dialog, async (newVal) => {
    if (newVal) {
        availableParents.value = <Array<MenuItem>><unknown>await api.get(`menu/${<string>route.params.uuid}/items`, { loadingKey: 'menu-item:parents'});
    }
});

const formatedAvailableParents = computed(() => {
    return flattenMenuTreeForSelect(buildMenuTree(availableParents.value));
});

const handleClose = () => {
    dialog.value = false;
    menuItem.value = {};
}

const handleCreate = async () => {
    const { valid } = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    let res = await api.post<{message: string, entity: MenuItem}>(`/menu/${<string>route.params.uuid}/item`,
        { ...menuItem.value },
        {
            loadingKey: 'menu-item:create',
            toast: true
        });

    emit("created", res.entity);
    handleClose();
}
</script>