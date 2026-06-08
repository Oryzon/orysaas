<template>
    <section>
        <v-container>
            <v-row>
                <v-col
                    v-for="(card, index) in data.cards"
                    :key="index"
                    cols="12"
                    :md="card.width"
                >
                    <v-card
                        height="100%"
                        :color="card.color"
                        rounded="16px"
                        elevation="1"
                        border="md"
                        flat
                    >
                        <v-card-text>
                            <v-row>
                                <v-col md="12">
                                    <v-avatar
                                        v-if="card.icon"
                                        variant="tonal"
                                        :color="card.color === 'primary' ? 'white' : 'primary'"
                                        :icon="card.icon"
                                        size="48"
                                        rounded="sm"
                                    ></v-avatar>

                                    <h3 v-if="card.title" class="text-display-small font-weight-bold mb-3 mt-3">
                                        {{ card.title }}
                                    </h3>

                                    <div v-if="card.text" class="card-content" v-html="card.text"></div>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import type { MultiCardsData } from '~/models/Block';

defineProps<{
    data: MultiCardsData;
}>();
</script>