<template>
    <v-row>
        <v-col md="12">
            <v-text-field
                v-model="localData.title"
                label="Titre de la section (optionnel)"
                placeholder="Questions fréquentes"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col md="12" class="mt-n6">
            <div class="d-flex align-center justify-space-between mb-4">
                <div>
                    <p class="text-body-2 text-medium-emphasis mb-0">{{ localData.items.length }} question{{ localData.items.length !== 1 ? 's' : '' }}</p>
                </div>

                <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    variant="tonal"
                    @click="addItem"
                >
                    Ajouter
                </v-btn>
            </div>

            <v-alert
                v-if="localData.items.length === 0"
                type="info"
                variant="tonal"
            >
                Aucune question. Cliquez sur "Ajouter" pour commencer.
            </v-alert>

            <v-row v-else>
                <v-col
                    md="12"
                    v-for="(item, index) in localData.items"
                    :key="index"
                >
                    <v-card>
                        <v-toolbar>
                            <v-toolbar-title>
                                <v-chip color="primary" label>#{{ index + 1 }}</v-chip>
                                &nbsp;
                                {{ item.question || 'Nouvelle question' }}
                            </v-toolbar-title>

                            <v-toolbar-items>
                                <v-btn
                                    icon
                                    color="error"
                                    @click.stop="removeItem(index)"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-toolbar-items>
                        </v-toolbar>

                        <v-card-text>
                            <v-row>
                                <v-col md="12">
                                    <v-text-field
                                        v-model="item.question"
                                        label="Question"
                                        variant="outlined"
                                        @update:model-value="emitUpdate"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="12" style="height: 180px;" class="mb-16 mt-n10">
                                    <client-only>
                                        <quill-editor
                                            v-model:content="item.answer"
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
import type { FaqData } from '~/models/Block';

interface Props {
    modelValue: FaqData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: FaqData];
}>();

const localData = ref<FaqData>({
    ...JSON.parse(JSON.stringify(props.modelValue)),
});

const addItem = () => {
    localData.value.items.push({ question: '', answer: '' });
    emitUpdate();
};

const removeItem = (index: number) => {
    localData.value.items.splice(index, 1);
    emitUpdate();
};

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

watch(() => props.modelValue, (newVal) => {
    localData.value = { ...JSON.parse(JSON.stringify(newVal)) };
}, { deep: true });
</script>

<style scoped>
.faq-panels {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    overflow: hidden;
}
</style>