<template>
    <v-app>
        <v-app-bar
            flat
            height="90"
            class="px-4 px-md-10"
            elevation="0"
            style="border-bottom: 2px solid rgba(0,0,0,0.08) !important;"
        >
            <NuxtLink to="/accueil" class="d-flex align-center text-decoration-none">
                <v-img
                    src="/logo.png"
                    contain
                    height="40"
                    width="40"
                />

                <span class="ml-2 text-headline-small font-weight-black text-decoration-none text-black">
                    Ory<span class="text-primary font-italic">SaaS</span>
                </span>
            </NuxtLink>

            <v-spacer></v-spacer>

            <div class="d-none d-md-flex ga-6">
                <visitors-menus-header
                    v-for="item in headerMenu"
                    :key="item.uuid"
                    :item="item"
                ></visitors-menus-header>
            </div>

            <v-spacer></v-spacer>

            <v-btn
                color="primary"
                variant="flat"
                to="login"
            >
                Connexion
            </v-btn>
        </v-app-bar>

        <v-main style="background-color: white;" class="pb-10">
            <slot></slot>
        </v-main>

        <visitors-menus-footer :items="footerMenu"></visitors-menus-footer>
    </v-app>
</template>

<script setup lang="ts">
import { buildMenuTree } from "~/models/MenuItem";

const drawer = ref(false);

const route = useRoute();
watch(() => route.path, () => {
    drawer.value = false;
});

const { bootstrap, load } = usePublicBootstrap();
await load();

const headerMenu = computed(() => buildMenuTree(bootstrap.value?.menus?.header ?? []));
const footerMenu = computed(() => buildMenuTree(bootstrap.value?.menus?.footer ?? []));
</script>