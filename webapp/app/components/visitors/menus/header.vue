<template>
    <template v-if="!asList">
        <v-menu
            v-if="hasChildren"
            open-on-hover
            close-on-content-click
            offset-y
        >
            <template #activator="{ props: menuProps }">
                <v-btn
                    v-bind="menuProps"
                    variant="text"
                    class="text-none mr-1 ml-1"
                    :to="buildTo(item.url)"
                    :href="isExternal(item.url) ? item.url : undefined"
                    :target="item.target || '_self'"
                >
                    {{ item.label }}

                    <v-icon size="16" class="ml-1">mdi-menu-down</v-icon>
                </v-btn>
            </template>

            <v-list density="comfortable">
                <visitors-menus-header
                    v-for="child in item.children"
                    :key="child.uuid"
                    :item="child"
                    :as-list="true"
                ></visitors-menus-header>
            </v-list>
        </v-menu>

        <v-btn
            v-else
            :variant="isCurrentRoute(item.url) ? 'tonal' : 'text'"
            :color="isCurrentRoute(item.url) ? 'primary' : undefined"
            class="text-none mr-1 ml-1"
            :to="buildTo(item.url)"
            :href="isExternal(item.url) ? item.url : undefined"
            :target="item.target || '_self'"
        >
            {{ item.label }}
        </v-btn>
    </template>

    <template v-else>
        <v-menu
            v-if="hasChildren"
            offset-x
            open-on-hover
            close-on-content-click
        >
            <template #activator="{ props: menuProps }">
                <v-list-item
                    v-bind="menuProps"
                    :to="isExternal(item.url) ? undefined : buildTo(item.url)"
                    :href="isExternal(item.url) ? item.url : undefined"
                    :target="item.target || '_self'"
                    :link="true"
                >
                    <v-list-item-title>{{ item.label }}</v-list-item-title>

                    <template #append>
                        <v-icon size="16">mdi-menu-right</v-icon>
                    </template>
                </v-list-item>
            </template>

            <v-list density="comfortable">
                <visitors-menus-header
                    v-for="child in item.children"
                    :key="child.uuid"
                    :item="child"
                    :as-list="true"
                ></visitors-menus-header>
            </v-list>
        </v-menu>

        <v-list-item
            v-else
            :to="isExternal(item.url) ? undefined : buildTo(item.url)"
            :href="isExternal(item.url) ? item.url : undefined"
            :target="item.target || '_self'"
            :link="true"
        >
            <v-list-item-title>{{ item.label }}</v-list-item-title>
        </v-list-item>
    </template>
</template>

<script setup lang="ts">
import type { MenuItemNode } from '~/models/MenuItem';

const props = defineProps<{
    item: MenuItemNode;
    asList?: boolean;
}>();

const asList = computed(() => props.asList ?? false);

const hasChildren = computed(
    () => props.item.children && props.item.children.length > 0,
);

const route = useRoute();

const isExternal = (url: string | undefined) => !!url && (url.startsWith('http://') || url.startsWith('https://'));

const isCurrentRoute = (url: string | undefined) => {
    if (!url || isExternal(url)) {
        return false;
    }

    const normalized = url.startsWith('/') ? url : `/${url}`;
    return route.path === normalized;
};

const buildTo = (url: string | undefined) => {
    if (!url || isExternal(url)) {
        return undefined;
    }

    return url.startsWith('/') ? url : `/${url}`;
};
</script>
