<template>
    <div class="password-strength mb-2">
        <div class="password-strength__bars">
            <div
                v-for="i in 4"
                :key="i"
                class="password-strength__bar"
                :class="i <= current.segments ? `bg-${current.vuetifyColor}` : 'password-strength__bar--empty'"
            ></div>
        </div>
    </div>

    <span
        v-if="password"
        class="password-strength__label"
        :class="`text-${current.vuetifyColor}`"
    >{{ current.label }} - {{ password.length }} caractères</span>
</template>

<script setup lang="ts">
import { z } from 'zod';

const props = defineProps<{
    password: string;
}>();

const criteriaSchemas = {
    length:    z.string().min(8),
    uppercase: z.string().regex(/[A-Z]/),
    lowercase: z.string().regex(/[a-z]/),
    number:    z.string().regex(/[0-9]/),
    special:   z.string().regex(/[^A-Za-z0-9]/),
};

const score = computed(() =>
    Object.values(criteriaSchemas)
        .filter(schema => schema.safeParse(props.password).success)
        .length
);

type Level = { label: string; vuetifyColor: string; segments: number };

const levels: Level[] = [
    { label: '',            vuetifyColor: '',            segments: 0 },
    { label: 'Mot de passe trop faible', vuetifyColor: 'error',       segments: 1 },
    { label: 'Mot de passe faible',      vuetifyColor: 'deep-orange', segments: 2 },
    { label: 'Mot de passe moyen',       vuetifyColor: 'warning',     segments: 3 },
    { label: 'Mot de passe fort',        vuetifyColor: 'success',     segments: 4 },
    { label: 'Mot de pass très fort',   vuetifyColor: 'teal',        segments: 4 },
];

const current = computed((): Level => levels[score.value] ?? levels[0]!);
</script>

<style scoped>
.password-strength {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
}

.password-strength__bars {
    display: flex;
    gap: 4px;
    flex: 1;
}

.password-strength__bar {
    height: 8px;
    flex: 1;
    border-radius: 99px;
    transition: background 0.3s ease;
}

.password-strength__bar--empty {
    background: rgba(75, 75, 75, 0.73);
}

.password-strength__label {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    min-width: 64px;
    text-align: right;
    transition: color 0.3s ease;
}
</style>