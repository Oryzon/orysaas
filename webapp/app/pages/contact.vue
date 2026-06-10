<template>
    <div class="contact-page">
        <div class="contact-blob-left"></div>
        <div class="contact-blob-right"></div>

        <v-row class="mt-8" justify="center">
            <v-col md="5">
                <v-row>
                    <v-col md="12">
                        <h1 class="text-display-large font-weight-black">Parlons<br/> de votre projet.</h1>
                        <p class="font-weight-light text-headline-small text-grey">Une démo, une question technique, un
                            partenariat...<br/> On est joignable.</p>
                    </v-col>

                    <v-col md="12" class="mt-n12 ml-n4">
                        <v-list lines="three">
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-avatar color="primary" rounded="12px" variant="tonal" size="60">
                                        <v-icon color="primary" size="36">mdi-email-outline</v-icon>
                                    </v-avatar>
                                </template>

                                <v-list-item-title class="font-weight-black text-capitalize">Email</v-list-item-title>
                                <v-list-item-subtitle class="font-weight-bold">vincent@orysaas.fr</v-list-item-subtitle>
                                <v-list-item-subtitle class="font-weight-light  text-grey">Réponse sous 2h ouvrées
                                </v-list-item-subtitle>
                            </v-list-item>

                            <v-list-item class="mt-n4">
                                <template v-slot:prepend>
                                    <v-avatar color="primary" rounded="12px" variant="tonal" size="60">
                                        <v-icon color="primary" size="36">mdi-message-processing-outline</v-icon>
                                    </v-avatar>
                                </template>

                                <v-list-item-title class="font-weight-black text-capitalize">Formulaire
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-bold">Disponible maintenant
                                </v-list-item-subtitle>
                                <v-list-item-subtitle class="font-weight-light text-grey">24h/24 - 7j/7
                                </v-list-item-subtitle>
                            </v-list-item>

                            <v-list-item class="mt-n4">
                                <template v-slot:prepend>
                                    <v-avatar color="primary" rounded="12px" variant="tonal" size="60">
                                        <v-icon color="primary" size="36">mdi-phone-outline</v-icon>
                                    </v-avatar>
                                </template>

                                <v-list-item-title class="font-weight-black text-capitalize">Téléphone
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-bold">+33.6.00.00.00.00</v-list-item-subtitle>
                                <v-list-item-subtitle class="font-weight-light  text-grey">Lun-Ven : 8h - 19h
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-col>

            <v-col md="5">
                <v-card
                    rounded="16px"
                    color="white"
                >
                    <v-card-text class="pa-10 text-black">
                        <v-form
                            ref="contactForm"
                            v-model="isFormValid"
                        >
                            <v-row>
                                <v-col md="6">
                                    <div class="text-body-large text-medium-emphasis font-weight-medium mb-1">Prénom <span class="font-weight-black text-error">*</span></div>

                                    <v-text-field
                                        hide-details="auto"
                                        density="compact"
                                        placeholder="Tony"
                                        variant="outlined"
                                        v-model="contact.firstname"
                                        :loading="isLoading"
                                        :disabled="isLoading"
                                        :rules="[ rules.required() ]"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="6">
                                    <div class="text-body-large text-medium-emphasis font-weight-medium mb-1">Nom <span class="font-weight-black text-error">*</span></div>

                                    <v-text-field
                                        hide-details="auto"
                                        density="compact"
                                        placeholder="STARK"
                                        variant="outlined"
                                        v-model="contact.lastname"
                                        :loading="isLoading"
                                        :disabled="isLoading"
                                        :rules="[ rules.required() ]"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="12" class="mt-n4">
                                    <div class="text-body-large text-medium-emphasis font-weight-medium mb-1">E-mail <span class="font-weight-black text-error">*</span></div>

                                    <v-text-field
                                        hide-details="auto"
                                        density="compact"
                                        placeholder="iron-man@stark-industries.fr"
                                        variant="outlined"
                                        v-model="contact.email"
                                        :loading="isLoading"
                                        :disabled="isLoading"
                                        :rules="[ rules.required() ]"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="12" class="mt-n4">
                                    <div class="text-body-large text-medium-emphasis font-weight-medium mb-1">Société</div>

                                    <v-text-field
                                        hide-details="auto"
                                        density="compact"
                                        placeholder="Stark Industries"
                                        variant="outlined"
                                        v-model="contact.company"
                                        :loading="isLoading"
                                        :disabled="isLoading"
                                    ></v-text-field>
                                </v-col>

                                <v-col md="12" class="mt-n4">
                                    <div class="text-body-large text-medium-emphasis font-weight-medium mb-1">Sujet</div>

                                    <v-chip
                                        v-for="subject in availableSubjects"
                                        class="mr-2"
                                        :color="subject === contact.subject ? 'primary' : ''"
                                        :variant="subject === contact.subject ? 'tonal' : 'outlined'"
                                        @click="handleChangeSubject(subject)"
                                    >{{ subject }}</v-chip>
                                </v-col>

                                <v-col md="12" class="mt-n4">
                                    <div class="text-body-large text-medium-emphasis font-weight-medium mb-1">Message <span class="font-weight-black text-error">*</span></div>

                                    <v-textarea
                                        hide-details="auto"
                                        density="compact"
                                        placeholder="Parlez-nous de votre projet..."
                                        variant="outlined"
                                        v-model="contact.message"
                                        rows="6"
                                        :loading="isLoading"
                                        :disabled="isLoading"
                                        :rules="[ rules.required(), rules.maxLength(2000) ]"
                                    ></v-textarea>
                                </v-col>

                                <v-col md="12" class="mt-n8 ml-n3">
                                    <v-checkbox color="primary" :rules="[ rules.required() ]" hide-details="auto">
                                        <template #label>
                                            J'accepte la&nbsp;<a href="" class="text-primary">politique de
                                            confidentialité</a>&nbsp;<span class="font-weight-black text-error">*</span>
                                        </template>
                                    </v-checkbox>
                                </v-col>

                                <v-col md="12">
                                    <v-btn color="primary" block append-icon="mdi-send" size="large" @click="handleSend">
                                        Envoyer le message
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
// @ToDo : Add the settings logic for making good things about the contact page

import type { Contact } from "~/models/Contact";

useConfigPage("Contact");

const api = useApi();

const rules = useValidationRules();
const contactForm = ref();
const isFormValid = ref(false);

const contact = ref<Partial<Contact>>({subject: 'Question commerciale'});
const availableSubjects = ref(['Question commerciale', 'Demander une démo', 'Support technique', 'Partenariat']);

const isLoading = computed(() => {
    return api.isLoading('contact:send');
});

const handleChangeSubject = (newSubject: string) => {
    contact.value.subject = newSubject;
}

const handleSend = async () => {
    const { valid } = await contactForm.value.validate();
    isFormValid.value = valid;

    if (!valid) {
        return;
    }

    await api.post("/contact",
        {...contact.value},
        {
            loadingKey: "contact:send",
            toast: true
        });

    contact.value = {};
}
</script>

<style scoped>
.contact-page {
    position: relative;
}

.contact-blob-left {
    position: absolute;
    top: -15%;
    left: -100px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 50%, transparent), transparent 60%);
    filter: blur(24px);
    pointer-events: none;
}

.contact-blob-right {
    position: absolute;
    top: 20%;
    right: -140px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 50%, transparent), transparent 60%);
    filter: blur(24px);
    pointer-events: none;
}
</style>