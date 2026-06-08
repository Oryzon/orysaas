<template>
    <v-row justify="center">
        <v-col :md="data.leftColumn.width" cols="12">
            <h1 class="mb-5 header-front">{{ data.leftColumn.title }}</h1>

            <div class="quill-content ql-editor" v-html="data.leftColumn.content"></div>
        </v-col>

        <v-col :md="data.rightColumn.width" cols="12">
            <h1 class="mb-5 header-front">{{ data.rightColumn.title }}</h1>

            <div class="quill-content ql-editor" v-html="data.rightColumn.content"></div>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { TwoColumnsData } from "~/models/Block";

defineProps<{
    data: TwoColumnsData,
    blockId?: string
}>();
</script>
