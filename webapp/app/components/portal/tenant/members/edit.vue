<template>
    <v-dialog v-model="dialog" max-width="600" :persistent="isLoading">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn icon variant="text" color="info" v-bind="activatorProps">
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
        </template>

        <template v-slot:default>
            <v-card flat>
                <v-toolbar color="blue">
                    <v-toolbar-title>
                        Modifier le rôle de <strong>{{ props.entity.member.lastname }} {{ props.entity.member.firstname }}</strong>
                    </v-toolbar-title>

                    <v-toolbar-items>
                        <v-btn @click="handleClose" :disabled="isLoading">
                            <v-icon color="white">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text class="px-6">
                    <v-form ref="form" v-model="isFormValid">
                        <v-row>
                            <v-col md="12">
                                <v-select
                                    hide-details="auto"
                                    label="Rôle"
                                    variant="outlined"
                                    v-model="selectedRole"
                                    :items="roleItems"
                                    item-title="label"
                                    item-value="value"
                                    :rules="[rules.required()]"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                ></v-select>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="bg-surface-light mt-n2">
                    <v-btn
                        color="success"
                        variant="tonal"
                        @click="handleUpdate"
                        :loading="isLoading"
                        :disabled="isLoading"
                    >
                        Enregistrer
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import { type OrganizationMember, OrganizationMemberRole, OrganizationMemberRoleLabel } from "~/models/OrganizationMember";

const props = defineProps<{
    entity: OrganizationMember;
}>();

const emit = defineEmits(['updated']);

const api = useApi();
const rules = useValidationRules();
const route = useRoute();
const slugOrganization = route.params.slugOrganization as string;

const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const selectedRole = ref<OrganizationMemberRole>(props.entity.role);

const isLoading = computed(() => api.isLoading("member:update"));

const roleItems = [
    { label: OrganizationMemberRoleLabel[OrganizationMemberRole.ADMIN], value: OrganizationMemberRole.ADMIN },
    { label: OrganizationMemberRoleLabel[OrganizationMemberRole.MEMBER], value: OrganizationMemberRole.MEMBER },
];

const handleClose = () => {
    dialog.value = false;
};

const handleUpdate = async () => {
    const { valid } = await form.value.validate();

    if (!valid) {
        return;
    }

    const res = await api.put<{ message: string, entity: OrganizationMember }>(
        `/tenant/${slugOrganization}/member/${props.entity.uuid}`,
        { role: selectedRole.value },
        {
            loadingKey: "member:update",
            toast: true,
        },
    );

    if (res?.entity) {
        emit("updated", res.entity);
        handleClose();
    }
};
</script>
