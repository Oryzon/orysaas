<template>
    <v-row align="center" justify="center" class="mb-3">
        <v-col md="10" cols="11">
            <v-row align="center" justify="center">
                <v-col :md="data.leftColumn.width" cols="12">
                    <v-card flat elevation="12">
                        <v-toolbar color="#1cafaf">
                            <v-toolbar-title class="font-weight-bold text-h5">{{ data.leftColumn.title }}</v-toolbar-title>
                        </v-toolbar>

                        <v-card-text>
                            <div class="text-body-1 quill-content ql-editor" v-html="data.leftColumn.content"></div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col :md="data.middleColumn.width" cols="12">
                    <v-card flat elevation="12">
                        <v-toolbar color="#1cafaf">
                            <v-toolbar-title class="font-weight-bold text-h5">{{ data.middleColumn.title }}</v-toolbar-title>
                        </v-toolbar>

                        <v-card-text>
                            <div class="text-body-1 quill-content ql-editor" v-html="data.middleColumn.content"></div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col :md="data.rightColumn.width" cols="12">
                    <v-card flat elevation="12">
                        <v-toolbar color="#1cafaf">
                            <v-toolbar-title class="font-weight-bold text-h5">{{ data.rightColumn.title }}</v-toolbar-title>
                        </v-toolbar>

                        <v-card-text>
                            <div class="text-body-1 quill-content ql-editor" v-html="data.rightColumn.content"></div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { ThreeColumnsData } from "~/models/Block";

defineProps<{
    data: ThreeColumnsData,
    blockId?: string
}>();
</script>
