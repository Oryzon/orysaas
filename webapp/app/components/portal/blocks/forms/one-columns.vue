<template>
    <v-row>
        <v-col md="8">
            <v-text-field
                v-model="localData.title"
                label="Titre principal"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="4">
            <v-select
                v-model="localData.width"
                @update:model-value="emitUpdate"
                label="Largeur de la colonne"
                variant="outlined"
                :items="widthSelect"
            ></v-select>
        </v-col>

        <v-col md="12" style="height: 500px;" class="mt-n8 mb-16">
            <client-only>
                <quill-editor
                    toolbar="full"
                    contentType="html"
                    v-model:content="localData.content"
                    @update:content="emitUpdate"
                ></quill-editor>
            </client-only>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { OneColumnsData } from "~/models/Block";

interface Props {
    modelValue: OneColumnsData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: OneColumnsData];
}>();

const widthSelect = [
    { title: '2', value: 2 },
    { title: '4 (Un quart de page)', value: 4 },
    { title: '6 (Moitié de page)', value: 6 },
    { title: '8 (Trois quart de page)', value: 8 },
    { title: '10', value: 10 },
];

const localData = ref<OneColumnsData>(JSON.parse(JSON.stringify(props.modelValue)));

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

// Watch pour synchroniser si le parent change
watch(() => props.modelValue, (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });
</script>
