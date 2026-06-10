<template>
    <v-row>
        <v-col md="4">
            <v-select
                v-model="localData.style"
                :items="styleOptions"
                label="Style de séparateur"
                variant="outlined"
                @update:model-value="emitUpdate"
            >
                <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                        <template #prepend>
                            <v-icon>{{ item.raw.icon }}</v-icon>
                        </template>
                    </v-list-item>
                </template>
                <template #selection="{ item }">
                    <v-icon class="mr-2">{{ item.raw.icon }}</v-icon>
                    {{ item.raw.title }}
                </template>
            </v-select>
        </v-col>

        <v-col md="4">
            <v-select
                v-model="localData.thickness"
                :items="thicknessOptions"
                label="Épaisseur"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>

        <v-col md="4">
            <v-select
                v-model="localData.width"
                :items="widthOptions"
                label="Largeur"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>

        <v-col md="6" v-if="localData.style !== 'gradient'" class="mt-n8">
            <v-menu
                v-model="showColorPicker"
                location="bottom"
                :close-on-content-click="false"
            >
                <template v-slot:activator="{ props }">
                    <v-text-field
                        v-model="localData.color"
                        label="Couleur"
                        variant="outlined"
                        readonly
                        v-bind="props"
                    >
                        <template #prepend-inner>
                            <div
                                class="color-preview"
                                :style="{ backgroundColor: localData.color || 'currentColor' }"
                            ></div>
                        </template>
                    </v-text-field>
                </template>

                <v-color-picker
                    v-model="localData.color"
                    mode="hex"
                    :modes="['hex']"
                    show-swatches
                    @update:model-value="emitUpdate"
                ></v-color-picker>
            </v-menu>
        </v-col>

        <v-col :md="localData.style !== 'gradient' ? 6 : 12" class="mt-n8">
            <v-select
                v-model="localData.spacing"
                :items="spacingOptions"
                label="Espacement vertical"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>

        <v-col cols="12" class="mt-n8">
            <v-card variant="outlined">
                <v-card-title class="text-caption text-medium-emphasis">
                    Prévisualisation
                </v-card-title>

                <pages-blocks-separator :data="localData" />
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { SeparatorData } from "~/models/Block";

interface Props {
    modelValue: SeparatorData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: SeparatorData];
}>();

const localData = ref<SeparatorData>(JSON.parse(JSON.stringify(props.modelValue)));

const styleOptions = [
    { value: 'line', title: 'Ligne simple', icon: 'mdi-minus' },
    { value: 'gradient', title: 'Dégradé', icon: 'mdi-gradient-horizontal' },
    { value: 'dots', title: 'Points', icon: 'mdi-dots-horizontal' },
    { value: 'wave', title: 'Vague', icon: 'mdi-wave' },
    { value: 'ornement', title: 'Ornement', icon: 'mdi-fleur-de-lis' },
];

const thicknessOptions = [
    { value: 'thin', title: 'Fine (1px)' },
    { value: 'medium', title: 'Moyenne (2px)' },
    { value: 'thick', title: 'Épaisse (4px)' },
];

const widthOptions = [
    { value: 'full', title: 'Pleine largeur' },
    { value: 'narrow', title: 'Étroite (60%)' },
    { value: 'ultranarrow', title: 'Très étroite (30%)' },
];

const spacingOptions = [
    { value: 'small', title: 'Petit (32px)' },
    { value: 'medium', title: 'Moyen (64px)' },
    { value: 'large', title: 'Grand (96px)' },
];

const showColorPicker = ref(false);

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

watch(() => props.modelValue, (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });
</script>

<style scoped>
.color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
