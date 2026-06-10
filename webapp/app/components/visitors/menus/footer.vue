<template>
    <v-footer class="footer-dark px-4 px-md-10">
        <v-row class="mt-10 mb-10">
            <v-col md="3">
                <NuxtLink to="/accueil" class="d-inline-flex align-center text-decoration-none">
                    <v-img
                        src="/logo.png"
                        contain
                        height="40"
                        width="40"
                        class="flex-shrink-0"
                    />

                    <span class="ml-2 text-headline-small font-weight-black text-decoration-none text-white">
                        Ory<span class="text-primary font-italic">SaaS</span>
                    </span>
                </NuxtLink>

                <br />

                <h3 class="text-white text-title-medium font-weight-thin">La base moderne pour lancer ton Saas sans repartir de zéro.</h3>
            </v-col>

            <v-col md="9">
                <v-row align="start" justify="end">
                    <v-col
                        v-for="item in items"
                        :key="item.uuid"
                        cols="6"
                        md="2"
                    >
                        <div class="text-white font-weight-black text-body-2 text-uppercase mb-4">
                            {{ item.label }}
                        </div>

                        <div v-for="child in item.children" :key="child.uuid" class="mb-2">
                            <a
                                v-if="isExternal(child.url)"
                                :href="child.url"
                                :target="child.target || '_blank'"
                                class="text-grey-lighten-2 text-decoration-none text-label-large"
                            >
                                {{ child.label }}
                            </a>

                            <NuxtLink
                                v-else
                                :to="buildTo(child.url)"
                                class="text-grey-lighten-2 text-decoration-none text-label-large"
                            >{{ child.label }}</NuxtLink>
                        </div>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-footer>
</template>

<script setup lang="ts">
import type { MenuItemNode } from "~/models/MenuItem";

defineProps<{
    items: MenuItemNode[];
}>();

const isExternal = (url: string | undefined) =>
    !!url && (url.startsWith('http://') || url.startsWith('https://'));

const buildTo = (url: string | undefined) => {
    if (!url || isExternal(url)) {
        return undefined;
    }

    return url.startsWith('/') ? url : `/${url}`;
};
</script>

<style scoped>
.footer-dark {
    background: linear-gradient(135deg, var(--brand-bg-dark) 0%, var(--brand-bg-mid) 93%, var(--brand-bg-deep) 100%);
}

.footer-logo-row {
    display: flex;
    align-items: center;
    height: 90px;
}

.footer-link {
    color: rgba(255, 255, 255, 0.55);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s ease;
}

.footer-link:hover {
    color: #fff;
}
</style>