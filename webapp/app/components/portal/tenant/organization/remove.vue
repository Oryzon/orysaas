<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading || step === 'confirm'">
        <template #activator="{ props: activatorProps }">
            <v-btn
                v-if="canDelete"
                color="error"
                variant="tonal"
                rounded="lg"
                min-width="140"
                v-bind="activatorProps"
            >
                Supprimer
            </v-btn>
        </template>

        <v-card flat>
            <v-toolbar color="error" flat>
                <v-toolbar-title class="d-flex align-center ga-2">
                    <v-icon>mdi-alert-circle-outline</v-icon>

                    {{ step === "warn" ? "Supprimer l'organisation" : "Confirmer la suppression" }}
                </v-toolbar-title>

                <v-btn icon :disabled="isLoading" @click="dialog = !dialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <template v-if="step === 'warn'">
                <v-card-text class="pa-6">
                    <v-alert
                        type="warning"
                        variant="tonal"
                        rounded="lg"
                        icon="mdi-alert-outline"
                        class="mb-4"
                    >
                        Cette action est <strong>irréversible</strong>.<br />
                        L'organisation et toutes ses données (membres, invitations, etc.) seront supprimées définitivement.
                    </v-alert>

                    <p class="text-body-2 text-medium-emphasis mb-0">
                        Un code de confirmation à 6 chiffres sera envoyé à votre adresse e-mail. Vous aurez <strong>15 minutes</strong> pour l'utiliser.
                    </p>
                </v-card-text>

                <v-card-actions class="pa-4 pt-0">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="error"
                        variant="flat"
                        rounded="lg"
                        append-icon="mdi-email-fast-outline"
                        :loading="isLoading"
                        @click="sendCode"
                    >
                        Envoyer le code
                    </v-btn>
                </v-card-actions>
            </template>

            <template v-else-if="step === 'confirm'">
                <v-card-text class="pa-6">
                    <v-alert
                        type="info"
                        variant="tonal"
                        rounded="lg"
                        icon="mdi-email-check-outline"
                        class="mb-4"
                    >
                        Un code à 6 chiffres a été envoyé à <strong>{{ user?.email }}</strong>. Il est valable <strong>15 minutes</strong>.
                    </v-alert>

                    <v-text-field
                        v-model="code"
                        label="Code de confirmation"
                        variant="outlined"
                        inputmode="numeric"
                        maxlength="6"
                        hide-details="auto"
                        :rules="[ rules.required() ]"
                        :loading="isLoading"
                        :disabled="isLoading"
                        class="code-input"
                        @keyup.enter="confirm"
                    ></v-text-field>
                </v-card-text>

                <v-card-actions class="pa-4 pt-0">
                    <v-spacer></v-spacer>

                    <v-btn
                        color="error"
                        variant="flat"
                        rounded="lg"
                        append-icon="mdi-trash-can-outline"
                        :loading="isLoading"
                        :disabled="code.length !== 6"
                        @click="confirm"
                    >
                        Confirmer la suppression
                    </v-btn>
                </v-card-actions>
            </template>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { OrganizationMemberRole } from '#shared/organization-roles';

const api = useApi();
const router = useRouter();
const route = useRoute();
const rules = useValidationRules();
const { user, currentOrganization, refreshOrganization } = useAuth();

const slugOrganization = route.params.slugOrganization as string;
const canDelete = useOrganizationCan(OrganizationMemberRole.OWNER);

const dialog = ref(false);
const step = ref<'warn' | 'confirm'>('warn');
const code = ref('');

const isLoading = computed(() => api.isLoading('org:delete-request') || api.isLoading('org:delete-confirm'));

watch(dialog, (opened) => {
    if (!opened) {
        step.value = 'warn';
        code.value = '';
    }
});

const sendCode = async () => {
    const res = await api.remove(`/tenant/${slugOrganization}/setting/request`, {
        loadingKey: 'org:delete-request',
        toast: true,
    });

    if (res) {
        step.value = 'confirm';
    }
};

const confirm = async () => {
    if (code.value.length !== 6) {
        return;
    }

    const res = await api.remove<{ nextOrgSlug: string | null }>(`/tenant/${slugOrganization}/setting/confirm`, {
        loadingKey: 'org:delete-confirm',
        toast: true,
        body: { code: code.value },
    });

    if (res) {
        dialog.value = false;

        if (res.nextOrgSlug) {
            await refreshOrganization(res.nextOrgSlug);
        } else {
            currentOrganization.value = {
                slug: null,
                name: null,
                logoUrl: null,
                nbMembers: 0,
                role: null,
            };
        }

        await router.push('/portal/dashboard');
    }
};
</script>