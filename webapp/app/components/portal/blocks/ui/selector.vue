<template>
    <v-dialog v-model="dialog" max-width="1000">
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                variant="flat"
                color="primary"
                size="large"
                prepend-icon="mdi-plus"
            >
                Ajouter un bloc
            </v-btn>
        </template>

        <v-card>
            <v-toolbar>
                <v-toolbar-title>Choisir un type de bloc</v-toolbar-title>

                <v-btn @click="dialog = false">
                    <v-icon color="error">mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text>
                <v-row>
                    <v-col
                        v-for="blockType in blockTypes"
                        :key="blockType.type"
                        md="4"
                    >
                        <v-card
                            class="block-type-card"
                            hover
                            @click="selectBlock(blockType.type)"
                        >
                            <v-card-text class="text-center pa-6">
                                <v-icon
                                    size="56"
                                    color="primary"
                                    class="mb-3"
                                >
                                    {{ blockType.icon }}
                                </v-icon>

                                <h3 class="text-h6 mb-2">{{ blockType.label }}</h3>

                                <p class="text-caption text-medium-emphasis">
                                    {{ blockType.description }}
                                </p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const { blockTypes } = useCmsBlocks();

const dialog = ref(false);

const emit = defineEmits<{
    select: [type: string];
}>();

const selectBlock = (type: string) => {
    emit('select', type);
    dialog.value = false;
};
</script>