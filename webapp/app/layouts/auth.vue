<template>
    <v-app>
        <v-row no-gutters style="min-height: 100vh">
            <v-col md="6" class="bg-login">
                <div class="bg-blob_top"></div>
                <div class="bg-blob_bottom"></div>

                <div class="auth_logo">
                    <v-img class="auth_logo_logo" src="logo.png" width="64" height="64"></v-img>
                    <span class="auth_logo_title">Ory<span class="text-primary">Saas</span></span>
                </div>

                <v-row justify="center" align="center" style="height: 100vh">
                    <v-col md="11">
                        <slot name="left" />
                    </v-col>
                </v-row>

                <!-- Add litle widget -->
            </v-col>

            <v-col md="6">
                <v-row justify="center" align="center" style="height: 100vh">
                    <v-col md="8">
                        <slot name="right" />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-app>
</template>

<script setup lang="ts">
defineSlots<{
    left(): any
    right(): any
}>()
</script>