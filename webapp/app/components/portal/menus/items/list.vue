<template>
    <v-list-group
        v-if="hasChildren"
        :value="item.uuid"
        :sub-group="depth > 0"
    >
        <template #activator="{ props: activatorProps, isOpen }">
            <v-list-item v-bind="activatorProps">
                <template #prepend>
                    <v-btn
                        :icon="isOpen ? 'mdi-arrow-collapse-vertical' : 'mdi-arrow-expand-vertical'"
                        size="small"
                        variant="text"
                        color="indigo"
                    ></v-btn>
                </template>

                <v-list-item-title>
                    {{ item.label }}

                    <span class="text-caption text-grey-darken-1 ml-2">
                        ({{ item.url }})
                    </span>

                    <v-chip v-if="!item.isVisible" class="ml-4" label color="error">Elément non visible</v-chip>
                </v-list-item-title>

                <template #append>
                    <v-btn
                        v-if="!item.isLast"
                        icon="mdi-chevron-down"
                        size="small"
                        variant="text"
                        @click.stop="handleMove('down', item.uuid)"
                    ></v-btn>

                    <v-btn
                        v-if="!item.isFirst"
                        icon="mdi-chevron-up"
                        size="small"
                        variant="text"
                        @click.stop="handleMove('up', item.uuid)"
                    ></v-btn>

                    <v-btn
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        color="info"
                        @click.stop="handleEdit"
                    ></v-btn>

                    <portal-menus-items-remove
                        :entity="item"
                        @removed="handleDelete"
                    ></portal-menus-items-remove>
                </template>
            </v-list-item>
        </template>

        <portal-menus-items-list
            v-for="child in item.children"
            :key="child.uuid"
            :item="child"
            :depth="depth + 1"
            @updated="$emit('updated', $event)"
            @removed="$emit('removed', $event)"
            @moved="(order, uuidItem) => $emit('moved', order, uuidItem)"
        ></portal-menus-items-list>
    </v-list-group>

    <v-list-item v-else>
        <v-list-item-title>
            {{ item.label }}

            <span class="text-caption text-grey-darken-1 ml-2">
                ({{ item.url }})
            </span>

            <v-chip v-if="!item.isVisible" class="ml-4" label color="error">Elément non visible</v-chip>
        </v-list-item-title>

        <template #append>
            <v-btn
                v-if="!item.isLast"
                icon="mdi-chevron-down"
                size="small"
                variant="text"
                @click.stop="handleMove('down', item.uuid)"
            ></v-btn>

            <v-btn
                v-if="!item.isFirst"
                icon="mdi-chevron-up"
                size="small"
                variant="text"
                @click.stop="handleMove('up', item.uuid)"
            ></v-btn>

            <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="info"
                @click.stop="handleEdit"
            ></v-btn>

            <portal-menus-items-remove
                :entity="item"
                @removed="handleDelete"
            ></portal-menus-items-remove>
        </template>
    </v-list-item>
</template>

<script setup lang="ts">
import type { MenuItem, MenuItemNode } from '~/models/MenuItem';

const props = defineProps<{
    item: MenuItemNode;
    depth?: number;
}>();

const emit = defineEmits<{
    (e: 'updated', item: MenuItemNode): void;
    (e: 'removed', item: Array<MenuItem>): void;
    (e: 'moved', order: string, uuidItem: string): void;
}>();

const hasChildren = computed(
    () => props.item.children && props.item.children.length > 0,
);

const depth = computed(() => props.depth ?? 0);

const handleEdit = () => {
    emit('updated', props.item);
}

const handleDelete = (data: Array<MenuItem>) => {
    emit('removed', data);
}

const handleMove = (order: string, uuidItem: string) => {
    emit('moved', order, uuidItem);
}
</script>
