<template>
    <v-btn
        icon="mdi-reply"
        variant="text"
        color="primary"
        :href="mailToLink"
    ></v-btn>
</template>

<script setup lang="ts">
import type { Contact } from "~/models/Contact";

const props = defineProps<{
    entity: Contact;
}>();

const { $date } = useNuxtApp();

const getMailtoLink = (item: Contact) => {
    const subject = encodeURIComponent(`En réponse à votre message ${item.subject} du ${$date.french(item.createdAt)}`);
    const body = encodeURIComponent('Bonjour, merci pour votre message. Voici notre réponse');
    return `mailto:${item.email}?subject=${subject}&body=${body}`;
};


const mailToLink = computed(() => {
    const subject = encodeURIComponent(`Réponse : ${props.entity.subject} - Le ${$date.french(props.entity.createdAt)}`);
    const body = encodeURIComponent(`Bonjour ${props.entity.lastname} ${props.entity.firstname}.
Merci pour votre message qui était le suivant :
"${props.entity.message}"\n
Voici notre réponse :\n\n
`);

    return `mailto:${props.entity.email}?subject=${subject}&body=${body}`
});
</script>