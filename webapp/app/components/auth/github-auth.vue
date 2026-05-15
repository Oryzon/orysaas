<template>
    <v-btn color="primary" @click="loginWithGithub" prepend-icon="mdi-github">
        S'identifier avec GitHub
    </v-btn>
</template>

<script setup>
const config = useRuntimeConfig();

const loginWithGithub = () => {
    alert("Not implemented yet");
};
</script>
