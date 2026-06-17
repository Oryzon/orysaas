<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-account-plus"
                v-bind="activatorProps"
            >
                Inviter
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card flat>
                <v-toolbar color="primary">
                    <v-toolbar-title>Inviter un membre</v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-form ref="form" v-model="isFormValid">
                        <v-row>
                            <v-col md="12">
                                <v-text-field
                                    hide-details="auto"
                                    label="Adresse e-mail"
                                    variant="outlined"
                                    v-model="invite.email"
                                    :rules="[ rules.required(), rules.isEmail() ]"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-text-field>
                            </v-col>

                            <v-col md="12" class="mt-n4">
                                <v-select
                                    hide-details="auto"
                                    label="Rôle"
                                    variant="outlined"
                                    v-model="invite.role"
                                    :items="roleItems"
                                    item-title="label"
                                    item-value="value"
                                    :rules="[ rules.required()] "
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-select>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-btn
                        color="primary"
                        variant="flat"
                        @click="handleInvite"
                        :loading="isLoading"
                        :disabled="isLoading"
                    >
                        Envoyer l'invitation
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import type { OrganizationInvite } from "~/models/OrganizationInvite";
import { OrganizationMemberRole, OrganizationMemberRoleLabel } from "~/models/OrganizationMember";

const api = useApi();
const dialog = ref(false);
const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;

const rules = useValidationRules();
const form = ref();
const isFormValid = ref(false);

const isLoading = computed(() => api.isLoading("member:invite"));

const roleItems = [
    { label: OrganizationMemberRoleLabel[OrganizationMemberRole.ADMIN], value: OrganizationMemberRole.ADMIN },
    { label: OrganizationMemberRoleLabel[OrganizationMemberRole.MEMBER], value: OrganizationMemberRole.MEMBER },
];

const invite = ref<Partial<OrganizationInvite>>({});

const handleClose = () => {
    dialog.value = false;
    invite.value = {};
    form.value?.reset();
};

const handleInvite = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.post<{ message: string }>(
        `/tenant/${slugOrganization}/member/invite`,
        { ...invite.value },
        {
            loadingKey: "member:invite",
            toast: true,
        },
    );

    if (res?.message) {
        handleClose();
    }
};
</script>