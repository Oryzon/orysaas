<template>
    <v-row>
        <v-col md="12">
            <div class="d-flex align-center justify-space-between mb-4">
                <div>
                    <h3 class="text-h6">Cartes</h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">{{ localData.cards.length }} carte{{ localData.cards.length !== 1 ? 's' : '' }}</p>
                </div>

                <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    variant="tonal"
                    @click="addCard"
                >
                    Ajouter
                </v-btn>
            </div>

            <v-alert
                v-if="localData.cards.length === 0"
                type="info"
                variant="tonal"
            >
                Aucune carte.
            </v-alert>

            <v-row>
                <v-col
                    v-for="(card, index) in localData.cards"
                    :key="index"
                    :md="card.width"
                >
                    <v-card>
                        <v-toolbar :color="card.color">
                            <v-toolbar-title>
                                <v-icon :color="card.color === 'primary' ? 'white' : 'primary'">{{ card.icon }}</v-icon>

                                {{ card.title || 'Nouvelle carte' }}
                            </v-toolbar-title>

                            <v-toolbar-items>
                                <v-btn
                                    icon
                                    color="error"
                                    @click.stop="removeCard(index)"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-toolbar-items>
                        </v-toolbar>

                        <v-card-text>
                            <v-row>
                                <v-col md="8">
                                    <v-text-field
                                        v-model="card.title"
                                        label="Titre"
                                        variant="outlined"
                                        @update:model-value="emitUpdate"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="4">
                                    <v-select
                                        v-model="card.color"
                                        label="Couleur"
                                        variant="outlined"
                                        :items="colorOptions"
                                        @update:model-value="emitUpdate"
                                    >
                                        <template #item="{ props: itemProps, item }">
                                            <v-list-item v-bind="itemProps">
                                                <template #prepend>
                                                    <v-icon :color="item.value" icon="mdi-circle" size="16" class="mr-2"></v-icon>
                                                </template>
                                            </v-list-item>
                                        </template>

                                        <template #selection="{ item }">
                                            <v-icon :color="item.value" icon="mdi-circle" size="14" class="mr-2"></v-icon>
                                            {{ item.title }}
                                        </template>
                                    </v-select>
                                </v-col>

                                <v-col md="8" class="mt-n8">
                                    <v-text-field
                                        v-model="card.icon"
                                        label="Icône MDI"
                                        placeholder="mdi-star"
                                        variant="outlined"
                                        @update:model-value="emitUpdate"
                                    >
                                        <template #append-inner>
                                            <v-icon v-if="card.icon" :icon="card.icon" :color="card.color || 'primary'"></v-icon>
                                        </template>
                                    </v-text-field>
                                </v-col>

                                <v-col md="4" class="mt-n8">
                                    <v-text-field
                                        v-model.number="card.width"
                                        label="Largeur (1-12)"
                                        type="number"
                                        variant="outlined"
                                        :min="1"
                                        :max="12"
                                        @update:model-value="emitUpdate"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="12" class="mt-n8 mb-16" style="height: 160px;">
                                    <client-only>
                                        <quill-editor
                                            v-model:content="card.text"
                                            content-type="html"
                                            theme="snow"
                                            @update:content="emitUpdate"
                                        ></quill-editor>
                                    </client-only>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { MultiCardsData } from '~/models/Block';

interface Props {
    modelValue: MultiCardsData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: MultiCardsData];
}>();

const localData = ref<MultiCardsData>({
    ...JSON.parse(JSON.stringify(props.modelValue)),
});

const colorOptions = [
    { title: 'Primary', value: 'primary' },
    { title: 'Secondary', value: 'navbar' },
    { title: 'Success', value: 'success' },
    { title: 'Error', value: 'error' },
    { title: 'Warning', value: 'warning' },
    { title: 'Info', value: 'info' },
    { title: 'Aucune', value: '' }
];

const addCard = () => {
    localData.value.cards.push({
        title: '',
        icon: 'mdi-star',
        text: '',
        color: 'primary',
        width: 4,
    });
    emitUpdate();
};

const removeCard = (index: number) => {
    localData.value.cards.splice(index, 1);
    emitUpdate();
};

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

watch(() => props.modelValue, (newVal) => {
    localData.value = { ...JSON.parse(JSON.stringify(newVal)) };
}, { deep: true });
</script>