<template>
    <v-row>
        <v-col md="6">
            <v-row>
                <v-col md="8">
                    <v-text-field
                        v-model="localData.leftColumn.title"
                        label="Titre principal"
                        variant="outlined"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col md="4">
                    <v-select
                        v-model="localData.leftColumn.width"
                        label="Largeur de la colonne"
                        variant="outlined"
                        :items="widthSelect"
                        @update:model-value="emitUpdate"
                    ></v-select>
                </v-col>

                <v-col md="12" style="height: 500px;" class="mt-n8 mb-16">
                    <client-only>
                        <quill-editor
                            toolbar="full"
                            contentType="html"
                            v-model:content="localData.leftColumn.content"
                            @update:content="emitUpdate"
                        ></quill-editor>
                    </client-only>
                </v-col>
            </v-row>
        </v-col>

        <v-col md="6">
            <v-row>
                <v-col md="8">
                    <v-text-field
                        v-model="localData.rightColumn.title"
                        label="Titre principal"
                        variant="outlined"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col md="4">
                    <v-select
                        v-model="localData.rightColumn.width"
                        label="Largeur de la colonne"
                        variant="outlined"
                        :items="widthSelect"
                        @update:model-value="emitUpdate"
                    ></v-select>
                </v-col>

                <v-col md="12" style="height: 500px;" class="mt-n8 mb-16">
                    <client-only>
                        <quill-editor
                            toolbar="full"
                            contentType="html"
                            v-model:content="localData.rightColumn.content"
                            @update:content="emitUpdate"
                        ></quill-editor>
                    </client-only>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { TwoColumnsData } from "~/models/Block";

interface Props {
    modelValue: TwoColumnsData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: TwoColumnsData];
}>();

const localData = ref<TwoColumnsData>(JSON.parse(JSON.stringify(props.modelValue)));

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

const widthSelect = [
    { title: '2', value: 2 },
    { title: '4 (Un quart de page)', value: 4 },
    { title: '6 (Moitié de page)', value: 6 },
    { title: '8 (Trois quart de page)', value: 8 },
    { title: '10', value: 10 },
];

// Watch pour synchroniser si le parent change
watch(() => props.modelValue, (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });
</script>
