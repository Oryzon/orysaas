<template>
    <v-btn
        color="primary"
        @click="loginWithFacebook"
        prepend-icon="mdi-facebook"
    >
        S'identifier avec Facebook
    </v-btn>
</template>

<script setup>
const config = useRuntimeConfig();

const loginWithFacebook = () => {
    alert("Not implemented yet");
};
</script>
