<template>
    <v-row>
        <v-col md="12">
            <v-card flat border>
                <v-card-text>
                    <v-row>
                        <v-col md="12">
                            <h2 class="text-h5 font-weight-bold">Voici votre espace</h2>
                            <p class="text-body-1 mt-3">Cette page est dédié à un certain affichage</p>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
const { currentOrganization } = useAuth();

useConfigPage("Tableau de bord");

definePageMeta({
    layout: "portal",
    middleware: "auth",
});
</script>
