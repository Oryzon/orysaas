e -->
<template>
    <v-row>
        <v-col cols="12" md="6">
            <v-select
                v-model="localData.layout"
                :items="[
                            { title: 'Centré', value: 'centered' },
                            { title: 'Split (2 colonnes)', value: 'split' },
                            { title: 'Banner', value: 'banner' },
                            { title: 'Card', value: 'card' }
                        ]"
                label="Type de mise en page"
                variant="outlined"
                @update:model-value="emitUpdate"
            >
                <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                        <template #prepend>
                            <v-icon :icon="getLayoutIcon(item.value)"/>
                        </template>
                    </v-list-item>
                </template>
            </v-select>
        </v-col>

        <v-col cols="12" md="6">
            <v-select
                v-model="localData.background"
                :items="[
                            { title: 'Primary', value: 'primary' },
                            { title: 'Secondary', value: 'secondary' },
                            { title: 'Gradient', value: 'gradient' }
                        ]"
                label="Couleur de fond"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-select>
        </v-col>

        <v-col cols="12" class="mt-n8">
            <v-text-field
                v-model="localData.preTitle"
                label="Pre-titre (optionnel)"
                placeholder="Ex: Prêt à démarrer ?"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col cols="6" class="mt-n8">
            <v-text-field
                v-model="localData.title"
                label="Titre principal *"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col cols="6" class="mt-n8">
            <v-text-field
                v-model="localData.subtitle"
                label="Sous-titre (optionnel)"
                variant="outlined"
                @update:model-value="emitUpdate"
            ></v-text-field>
        </v-col>

        <v-col v-if="localData.layout !== 'banner'" cols="12" style="height: 120px;" class="mt-n8 mb-16">
            <label class="text-subtitle-2 mb-2 d-block">Description (optionnelle)</label>

            <client-only>
                <quill-editor
                    v-model:content="localData.description"
                    contentType="html"
                    theme="snow"
                    :toolbar="['bold', 'italic', 'underline', 'link']"
                    @update:model-value="emitUpdate"
                ></quill-editor>
            </client-only>
        </v-col>

        <v-col md="6">
            <v-row>
                <v-col cols="12">
                    <h3 class="text-h6 mb-4">Bouton principal</h3>
                </v-col>

                <v-col cols="12" class="mt-n8">
                    <v-text-field
                        v-model="localData.primaryButton.text"
                        label="Texte du bouton"
                        variant="outlined"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col cols="12" class="mt-n8">
                    <v-text-field
                        v-model="localData.primaryButton.url"
                        label="URL"
                        variant="outlined"
                        :disabled="!localData.primaryButton.text"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-col>

        <v-col md="6">
            <v-row>
                <v-col cols="12">
                    <h3 class="text-h6 mb-4">Bouton secondaire</h3>
                </v-col>

                <v-col cols="12" class="mt-n8">
                    <v-text-field
                        v-model="localData.secondaryButton.text"
                        label="Texte du bouton"
                        variant="outlined"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>

                <v-col cols="12" class="mt-n8">
                    <v-text-field
                        v-model="localData.secondaryButton.url"
                        label="URL"
                        variant="outlined"
                        :disabled="!localData.secondaryButton.text"
                        @update:model-value="emitUpdate"
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { CtaBlockData } from "~/models/Block";

interface Props {
    modelValue: CtaBlockData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: CtaBlockData];
}>();

// État local
const localData = ref<CtaBlockData>({
    ...JSON.parse(JSON.stringify(props.modelValue)),
});

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localData.value)));
};

const getLayoutIcon = (layout: string) => {
    const icons: Record<string, string> = {
        centered: 'mdi-format-align-center',
        split: 'mdi-view-split-vertical',
        banner: 'mdi-dock-top',
        card: 'mdi-card-outline'
    };
    return icons[layout] || 'mdi-view-dashboard';
};
</script>