<template>
    <div class="d-flex flex-column align-items-center" style="gap: 10px">
        <google-auth />
        <facebook-auth />
        <github-auth />
    </div>
</template>
<script setup lang="ts">
import GoogleAuth from "~/components/auth/google-auth.vue";
import FacebookAuth from "~/components/auth/facebook-auth.vue";
import GithubAuth from "~/components/auth/github-auth.vue";
</script>
