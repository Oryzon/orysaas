<template>
    <v-container fluid class="dashboard-org-shell px-4 px-md-8 py-4 py-md-6">
        <v-row justify="center" align="stretch" class="dashboard-org-shell__row">
            <v-col cols="12" lg="10" xl="8">
                <v-card class="dashboard-org-card mx-auto" rounded="xl" flat>
                    <div class="dashboard-org-hero bg-brand-dark text-white text-center pa-6 pa-md-8">
                        <div class="dashboard-org-badge">
                            <v-icon size="18" color="white">mdi-office-building-plus</v-icon>
                            <span class="font-weight-medium text-caption text-white">Première étape de configuration</span>
                        </div>

                        <h1 class="dashboard-org-title text-white">Vous n'avez encore aucune organisation</h1>

                        <p class="dashboard-org-text mx-auto text-white">
                            Pour commencer à utiliser le portail, vous devez créer votre première organisation. Saisissez le nom, l'adresse
                            et les coordonnées de votre structure pour ouvrir votre espace avec une base propre et exploitable.
                        </p>

                        <div class="dashboard-org-cta d-flex justify-center">
                            <portal-tenant-organization-create />
                        </div>
                    </div>

                    <v-card-text class="dashboard-org-content pa-4 pa-md-6 pa-lg-8 text-center">
                        <v-list class="dashboard-org-list bg-transparent px-0 text-left" lines="one">
                            <v-list-item
                                prepend-icon="mdi-check-circle-outline"
                                title="Vous devez créer une organisation pour continuer"
                                class="px-0"
                            />
                            <v-list-item
                                prepend-icon="mdi-check-circle-outline"
                                title="Ajoutez votre logo, votre adresse et vos informations de contact"
                                class="px-0"
                            />
                            <v-list-item
                                prepend-icon="mdi-check-circle-outline"
                                title="Ensuite, vous pourrez inviter vos membres et modifier votre interface"
                                class="px-0"
                            />
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.dashboard-org-card {
    width: 100%;
    overflow: hidden;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.09);
    box-shadow:
        0 28px 80px rgba(15, 23, 42, 0.12),
        0 2px 8px rgba(15, 23, 42, 0.06);
    background: rgba(var(--v-theme-surface), 0.92);
    backdrop-filter: blur(14px);
}

.dashboard-org-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 13px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.dashboard-org-title {
    margin-top: 22px;
    max-width: 16ch;
    margin-inline: auto;
    font-size: clamp(2rem, 3.3vw, 3.25rem);
    line-height: 1.02;
    font-weight: 900;
    letter-spacing: -0.045em;
    text-wrap: balance;
}

.dashboard-org-text {
    margin-top: 16px;
    max-width: 46rem;
    font-size: 1.02rem;
    line-height: 1.72;
    opacity: 0.9;
}

.dashboard-org-cta {
    display: flex;
    justify-content: center;
    width: 100%;
}

.dashboard-org-cta :deep(.v-card) {
    width: min(100%, 320px);
}

.dashboard-org-cta :deep(.v-btn) {
    width: auto;
    min-width: 0;
    max-width: 100%;
    white-space: nowrap;
}

.dashboard-org-list :deep(.v-list-item-title) {
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
}

.dashboard-org-list :deep(.v-list-item__prepend) {
    margin-inline-end: 12px;
    color: rgb(var(--v-theme-primary));
}

.dashboard-org-list :deep(.v-list-item) {
    margin-bottom: 4px;
    border-radius: 14px;
    padding-inline: 8px;
    background: rgba(var(--v-theme-primary), 0.04);
    border: 1px solid rgba(var(--v-theme-primary), 0.48);
}

@media (max-width: 959px) {
    .dashboard-org-shell {
        padding-inline: 0;
    }

    .dashboard-org-title {
        max-width: 16ch;
        font-size: clamp(1.8rem, 2.8vw, 2.8rem);
    }

    .dashboard-org-cta {
        justify-content: stretch;
    }

    .dashboard-org-cta :deep(.v-card) {
        width: 100%;
    }
}
</style>
