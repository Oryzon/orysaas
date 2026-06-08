<template>
    <section class="faq-section">
        <v-container>
            <v-row justify="center">
                <v-col cols="12" md="10" lg="10">
                    <h2 v-if="data.title" class="text-h3 font-weight-bold text-left mb-2">
                        {{ data.title }}
                    </h2>

                    <div class="faq-list">
                        <div
                            v-for="(item, index) in data.items"
                            :key="index"
                            class="faq-item"
                            :class="{ 'faq-item--active': openIndex === index }"
                        >
                            <button class="faq-question" @click="toggle(index)">
                                <span>{{ item.question }}</span>
                                <v-icon :icon="openIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
                            </button>

                            <div v-show="openIndex === index" class="faq-answer" v-html="item.answer"></div>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import type { FaqData } from '~/models/Block';

defineProps<{
    data: FaqData;
}>();

const openIndex = ref<number | null>(null);

const toggle = (index: number) => {
    openIndex.value = openIndex.value === index ? null : index;
};
</script>

<style scoped>
.faq-section {
    padding: 10px 0;
}

.faq-list {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    overflow: hidden;
}

.faq-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.faq-item:last-child {
    border-bottom: none;
}

.faq-question {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    text-align: left;
    transition: background-color 0.2s, color 0.2s;
}

.faq-item--active .faq-question {
    background-color: rgba(var(--v-theme-primary), 0.06);
    color: rgb(var(--v-theme-primary));
}

.faq-answer {
    margin-top: -16px;
    padding: 0 20px 18px;
    font-size: 0.9rem;
    line-height: 1.7;
    background-color: rgba(var(--v-theme-primary), 0.06);
    color: black;
}
</style>