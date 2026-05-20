<template>
    <svg :width="props.width" :height="props.height" :viewBox="props.viewBox">
        <path
            fill="#00A4EF"
            d="M0 0h11.422v11.422H0zm12.578 0H24v11.422H12.578zM0 12.578h11.422V24H0zm12.578 0H24V24H12.578z"
        />
    </svg>
</template>
<script setup lang="ts">
interface Props {
    width?: number;
    height?: number;
    viewBox?: string;
}

const props = withDefaults(defineProps<Props>(), {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
});
</script>
