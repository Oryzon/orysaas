<template>
    <v-dialog v-model="dialog" max-width="1200" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                class="mr-2"
                v-bind="activatorProps"
                variant="flat"
                color="success"
                prepend-icon="mdi-list-box"
            >
                Gestion des quotas
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="isLoading">
                <v-toolbar color="success">
                    <v-toolbar-title>Gestion des options de quota</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <v-data-table
                                :headers="headers"
                                :items="quotas"
                                :loading="isLoading"
                                loading-text="Chargement des quotas en cours."
                                no-data-text="Il n'y a pas de quota."
                                items-per-page="25"
                            >
                                <template v-slot:item.key="{ value }">
                                    <strong>
                                        {{ QuotaKeyLabel[value as QuotaKey] }}
                                    </strong>

                                    <br />

                                    <em>{{ value }}</em>
                                </template>

                                <template v-slot:item.defaultValue="{ value }">
                                    {{ value ?? "Infini" }}
                                </template>

                                <template v-slot:item.unit="{ value }">
                                    {{ QuotaUnitLabel[value as QuotaUnit] }}
                                </template>

                                <template v-slot:item.period="{ value }">
                                    {{ QuotaPeriodLabel[value as QuotaPeriod] }}
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <portal-quotas-edit
                                        :entity="item"
                                        @updated="updateToQuotas"
                                    ></portal-quotas-edit>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="bg-surface-light">
                    <v-spacer></v-spacer>

                    <portal-quotas-add
                        @created="addToQuotas"
                    ></portal-quotas-add>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import type { Quota } from "~/models/Quota";
import {QuotaKey, QuotaKeyLabel, QuotaPeriod, QuotaPeriodLabel, QuotaUnit, QuotaUnitLabel} from "#shared/quota";

const api = useApi();
const dialog = ref(false);

const quotas = ref<Array<Quota>>([]);

const isLoading = computed(() => api.isLoading('quotas:list'));

const headers = computed(() => {
    return [
        { title: "Nom & Clé", key: "key" },
        { title: "Valeur par défaut", key: "defaultValue" },
        { title: "Unité", key: "unit" },
        { title: "Période", key: "period" },
        { title: "Actions", key: "actions", align: "end" },
    ];
});

watch(dialog, async (newVal) => {
    if (newVal) {
        quotas.value = await api.get<Array<Quota>>(`/quotas/`, {
            loadingKey: 'quotas:list',
            toast: false,
        });
    }
});

const handleClose = () => {
    dialog.value = false;
};

const addToQuotas = (data: Quota) => {
    quotas.value.push(data);
}

const updateToQuotas = (data: Quota) => {
    quotas.value = quotas.value.map((quota) => {
        if (quota.uuid === data.uuid) {
            return data;
        }

        return quota;
    });
}
</script>