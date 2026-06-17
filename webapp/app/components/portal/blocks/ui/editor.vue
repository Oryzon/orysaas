<template>
    <v-card flat>
        <v-toolbar color="primary">
            <v-toolbar-title>Blocs de contenu</v-toolbar-title>

            <v-toolbar-items>
                <portal-blocks-ui-selector
                    @select="addBlock"
                ></portal-blocks-ui-selector>
            </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
            <v-row>
                <v-col md="12">
                    <v-alert
                        v-if="localBlocks.length === 0"
                        type="info"
                        variant="tonal"
                        class="mb-6"
                    >
                        Aucun bloc pour le moment.
                    </v-alert>

                    <draggable
                        v-model="localBlocks"
                        item-key="uuid"
                        handle=".drag-handle"
                        @end="onDragEnd"
                    >
                        <template #item="{ element, index }">
                            <portal-blocks-ui-item
                                :block="element"
                                @update:data="updateBlockData(index, $event)"
                                @toggle-visibility="toggleBlockVisibility(index)"
                                @delete="deleteBlock(index)"
                            ></portal-blocks-ui-item>
                        </template>
                    </draggable>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import type { Block } from "~/models/Block";

interface Props {
    modelValue: Block[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: Block[]];
}>();

const { createNewBlock } = useCmsBlocks();

const localBlocks = ref<Block[]>(JSON.parse(JSON.stringify(props.modelValue ?? [])));

watch(() => props.modelValue, (newVal) => {
    localBlocks.value = JSON.parse(JSON.stringify(newVal ?? []));
}, { deep: true });

const emitUpdate = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(localBlocks.value)));
};

const addBlock = (type: string) => {
    const newBlock = createNewBlock(type, localBlocks.value.length);

    if (newBlock) {
        // @ts-ignore
        localBlocks.value.push(newBlock);
        emitUpdate();
    }
};

const updateBlockData = (index: number, data: Record<string, any>) => {
    // @ts-ignore
    localBlocks.value[index].data = data;
    emitUpdate();
};

const toggleBlockVisibility = (index: number) => {
    // @ts-ignore
    localBlocks.value[index].visible = !localBlocks.value[index].visible;
    emitUpdate();
};

const deleteBlock = (index: number) => {
    // @ToDo : Add a confirm modal
    localBlocks.value.splice(index, 1);
    emitUpdate();
};

const onDragEnd = () => {
    localBlocks.value.forEach((block, index) => {
        block.order = index;
    });

    emitUpdate();
};
</script>
