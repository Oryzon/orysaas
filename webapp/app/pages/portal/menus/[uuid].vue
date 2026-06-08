<template>
    <v-row>
        <v-col md="12">
            <v-form
                ref="form"
                v-model="isFormValid"
            >
                <v-row>
                    <v-col md="5">
                        <v-text-field
                            hide-details="auto"
                            variant="solo"
                            label="Label"
                            v-model="menu.label"
                            :loading="isLoading"
                            :disabled="isLoading"
                            :rules="[ rules.required() ]"
                        ></v-text-field>
                    </v-col>

                    <v-col md="3">
                        <v-text-field
                            hide-details="auto"
                            variant="solo"
                            label="Clé"
                            v-model="menu.key"
                            :loading="isLoading"
                            disabled
                            :rules="[ rules.required() ]"
                        ></v-text-field>
                    </v-col>

                    <v-col md="3">
                        <v-switch
                            class="float-right"
                            label="Menu activé ?"
                            v-model="menu.isActive"
                            :loading="isLoading"
                            :disabled="isLoading"
                            inset
                            color="success"
                        ></v-switch>
                    </v-col>
                </v-row>
            </v-form>
        </v-col>

        <v-col md="12" class="mt-n8">
            <v-row>
                <v-col md="8">
                    <v-card flat>
                        <v-toolbar color="primary">
                            <v-toolbar-title>
                                Elément du menu
                            </v-toolbar-title>

                            <v-toolbar-items>
                                <portal-menus-items-add
                                    @created="addToItems"
                                ></portal-menus-items-add>
                            </v-toolbar-items>
                        </v-toolbar>

                        <v-card-text>
                            <v-row>
                                <v-col md="12">
                                    <v-list v-model:opened="openedGroups">
                                        <portal-menus-items-list
                                            v-for="item in buildMenuTree(menu.items ?? [])"
                                            :key="item.uuid"
                                            :item="item"
                                            @updated="selectToUpdate"
                                            @removed="removeToItems"
                                            @moved="moveItems"
                                        ></portal-menus-items-list>
                                    </v-list>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col md="4">
                    <v-card flat>
                        <v-toolbar color="primary">
                            <v-toolbar-title>Modifier l'élément</v-toolbar-title>
                        </v-toolbar>

                        <v-card-text>
                            <v-form
                                ref="formMenuItem"
                                v-model="isFormMenuItemValid"
                            >
                                <v-row>
                                    <v-col md="12" v-if="selectedMenuItem.uuid === ''">
                                        <v-alert type="warning">Merci de sélectionner l'élément a modifier en cliquant sur le stylo.</v-alert>
                                    </v-col>

                                    <v-col md="12" class="mt-n2">
                                        <v-select
                                            hide-details="auto"
                                            variant="outlined"
                                            label="Parent"
                                            v-model="selectedMenuItem.parentUuid"
                                            :loading="isLoading"
                                            :disabled="isLoading || selectedMenuItem.uuid === ''"
                                            :items="formatedAvailableParents"
                                            clearable
                                        ></v-select>
                                    </v-col>

                                    <v-col md="12" class="mt-n4">
                                        <v-text-field
                                            hide-details="auto"
                                            label="Label"
                                            variant="outlined"
                                            v-model="selectedMenuItem.label"
                                            :loading="isLoading"
                                            :disabled="isLoading || selectedMenuItem.uuid === ''"
                                            :rules="[ rules.required() ]"
                                        ></v-text-field>
                                    </v-col>

                                    <v-col md="6" class="mt-n4">
                                        <v-select
                                            hide-details="auto"
                                            variant="outlined"
                                            label="Cible"
                                            v-model="selectedMenuItem.target"
                                            :loading="isLoading"
                                            :disabled="isLoading || selectedMenuItem.uuid === ''"
                                            :rules="[ rules.required() ]"
                                            :items="targets"
                                        ></v-select>
                                    </v-col>

                                    <v-col md="6" class="mt-n4 mb-n6">
                                        <v-switch
                                            label="Est visible ?"
                                            inset
                                            color="success"
                                            v-model="selectedMenuItem.isVisible"
                                            :loading="isLoading"
                                            :disabled="isLoading || selectedMenuItem.uuid === ''"
                                        ></v-switch>
                                    </v-col>

                                    <v-col md="12" class="mt-n4">
                                        <v-text-field
                                            hide-details="auto"
                                            variant="outlined"
                                            label="URL"
                                            v-model="selectedMenuItem.url"
                                            :loading="isLoading"
                                            :disabled="isLoading || selectedMenuItem.uuid === ''"
                                        >
                                            <template v-slot:append-inner>
                                                <portal-pages-search-for-menu
                                                    @selected="(data) => selectedMenuItem.url = data"
                                                ></portal-pages-search-for-menu>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>

                        <v-card-actions class="bg-surface-light mt-n2" >
                            <v-spacer></v-spacer>

                            <v-btn
                                color="success"
                                variant="flat"
                                @click="handleUpdateItem"
                                :disabled="!isFormMenuItemValid"
                                append-icon="mdi-check"
                            >
                                Modifier
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { Menu } from "~/models/Menu";
import {
    buildMenuTree,
    flattenMenuTreeForSelect,
    type MenuItem,
    type MenuItemNode, targets
} from "~/models/MenuItem";

const api = useApi();

useConfigPage("Modifier le menu");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});

const rules = useValidationRules();
const route = useRoute();

const isLoading = computed(() => {
    return api.isLoading('menu:detail') || api.isLoading('menu-item:update') || api.isLoading('menu:update');
});

let menu = ref<Partial<Menu>>({});
const openedGroups = ref<string[]>([]);

onMounted(async () => {
    menu.value = <Menu><unknown>await api.get(`menu/${<string>route.params.uuid}`, {
        loadingKey: 'menu:detail'
    });
});

const form = ref();
const isFormValid = ref(false);

const handleUpdate = async () => {
    const {valid} = await form.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    await api.put(`/menu/${<string>route.params.uuid}`,
        { ...menu.value },
        {
            loadingKey: 'menu:update',
            toast: true
        });
};

// Update item parts
const formMenuItem = ref();
const isFormMenuItemValid = ref(false);

const formatedAvailableParents = computed(() => {
    return flattenMenuTreeForSelect(buildMenuTree(menu.value.items ?? []));
});

let selectedMenuItem = ref<Partial<MenuItem>>({ uuid: '' });

const selectToUpdate = (data: MenuItemNode) => {
    selectedMenuItem.value = {...<MenuItem>menu.value.items?.find((item) => item.uuid === data.uuid)}; // cut reactivity
}

const handleUpdateItem = async () => {
    const { valid } = await formMenuItem.value.validate();
    isFormMenuItemValid.value = valid;

    if (!valid) {
        return;
    }

    let res = await api.put<{ entity: MenuItem }>(`/menu/${<string>route.params.uuid}/item/${selectedMenuItem.value.uuid}`,
        { ...selectedMenuItem.value },
        {
            loadingKey: 'menu-item:update',
            toast: true
        });

    menu.value.items = (menu.value.items ?? []).map((item) => {
        if (item.uuid === res?.entity.uuid) {
            return res?.entity;
        }

        return item;
    });
}

const addToItems = (data: MenuItem) => {
    menu.value.items?.push(data);
};

const moveItems = async (order: string, uuidItem: string) => {
    let res = await api.put<{ entity: MenuItem[] }>(`/menu/${<string>route.params.uuid}/item/${uuidItem}/${order}`,
        { },
        {
            loadingKey: 'menu-item:update',
            toast: true
        });

    menu.value.items = (menu.value.items ?? []).map((item) => {
        let isFinded = res.entity.find((ent: MenuItem) => ent.uuid === item.uuid);

        if (isFinded) {
            return isFinded;
        }

        return item;
    });
}

const removeToItems = (data: Array<MenuItem>) => {
    menu.value.items = data;
}
</script>