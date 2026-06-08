<template>
    <v-row justify="center" align="center" class="mt-2">
        <v-col :md="data.width" cols="11">
            <h3 class="text-h3 font-weight-bold mb-2 text-center text-md-start">{{ data.title}}</h3>

            <div class="text-h6 quill-content ql-editor" v-html="data.content"></div>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { OneColumnsData } from "~/models/Block";

defineProps<{
    data: OneColumnsData,
    blockId?: string
}>();
</script>
