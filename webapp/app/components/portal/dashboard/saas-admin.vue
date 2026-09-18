<template>
    <v-row>
        <v-col md="12" v-if="isLoading">
            <v-card flat border>
                <v-card-text class="text-center py-10">
                    <v-progress-circular indeterminate color="primary" />
                </v-card-text>
            </v-card>
        </v-col>

        <template v-else-if="stats">
            <v-col v-for="card in kpiCards" :key="card.key" cols="12" md="4">
                <v-card rounded="lg" elevation="1" class="widget-card">
                    <v-card-text class="py-4 px-5">
                        <div class="d-flex align-center justify-space-between mt-n2">
                            <div>
                                <p class="text-caption text-medium-emphasis font-weight-medium text-uppercase mb-1">
                                    {{ card.label }}
                                </p>

                                <h1 class="text-h4 font-weight-bold mt-n1 mb-n1" :class="`text-${card.color}`">
                                    {{ card.isCurrency ? $price(card.value) : card.value }}
                                </h1>

                                <p class="text-caption mt-1 mb-0" :class="`text-${card.captionColor ?? card.color}`">
                                    <v-icon size="14" :color="card.captionColor ?? card.color">{{ card.captionIcon }}</v-icon>
                                    {{ card.captionText }}
                                </p>
                            </div>

                            <v-avatar :color="`${card.color}-lighten-4`" size="52" rounded="lg">
                                <v-icon :color="`${card.color}-darken-2`" size="26">{{ card.icon }}</v-icon>
                            </v-avatar>
                        </div>
                    </v-card-text>

                    <div class="widget-bar" :class="`bg-${card.color}`"></div>
                </v-card>
            </v-col>

            <v-col md="7">
                <v-card flat border rounded="lg" class="h-100">
                    <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4 d-flex align-center justify-space-between">
                        <span>
                            <v-icon start color="primary">mdi-chart-line</v-icon>
                            Revenus (6 derniers mois)
                        </span>

                        <span class="text-h6 font-weight-bold">
                            Mois en cours : {{ $price(stats.revenue.thisMonth) }}
                        </span>
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pt-6">
                        <v-sparkline
                            :model-value="stats.revenue.last6Months.map((item) => item.amount)"
                            :labels="stats.revenue.last6Months.map((item) => $date.format(`${item.month}-01`, 'LLL'))"
                            color="green"
                            :line-width="2"
                            smooth-mode="monotone"
                            :smooth="16"
                            padding="12"
                            height="160"
                            label-size="6"
                            tooltip
                            inset
                            interactive
                            show-markers
                            marker-size="6"
                        >
                            <template v-slot:tooltip="{ index, value }">
                                <v-list-item density="compact" lines="two">
                                    <template v-slot:prepend>
                                        <v-avatar :color="TREND_META[trend[index]].color" variant="tonal">
                                            <v-icon :icon="TREND_META[trend[index]].icon"></v-icon>
                                        </v-avatar>
                                    </template>

                                    <div class="text-body-small">{{ months[index] }}</div>
                                    <div class="text-body-large">{{ $price(value) }}</div>
                                </v-list-item>
                            </template>
                        </v-sparkline>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col md="5">
                <v-row>
                    <v-col md="12">
                        <v-card flat border rounded="lg">
                            <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                                <v-icon start color="primary">mdi-chart-donut</v-icon>
                                Répartition par plan
                            </v-card-title>

                            <v-divider />

                            <v-card-text v-if="stats.subscriptions.byPlan.length">
                                <div v-for="plan in stats.subscriptions.byPlan" :key="plan.title" class="mb-4">
                                    <div class="d-flex justify-space-between text-body-2 mb-1">
                                        <span class="font-weight-medium">{{ plan.title }}</span>
                                        <span class="text-medium-emphasis">{{ plan.count }}</span>
                                    </div>

                                    <v-progress-linear :model-value="planPercent(plan.count)" color="primary" height="6" rounded />
                                </div>
                            </v-card-text>

                            <v-card-text v-else class="text-medium-emphasis text-caption">Aucun abonnement actif.</v-card-text>
                        </v-card>
                    </v-col>

                    <v-col md="12">
                        <v-card flat border rounded="lg">
                            <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-4">
                                <v-icon start color="primary">mdi-domain-plus</v-icon>
                                Dernières organisations inscrites
                            </v-card-title>

                            <v-divider />

                            <v-card-text v-if="stats.recentOrganizations.length">
                                <v-row>
                                    <v-col md="12">
                                        <v-list lines="two">
                                            <template v-for="(organization, index) in stats.recentOrganizations" :key="organization.slug">
                                                <v-list-item :to="`/portal/organizations/${organization.slug}`">
                                                    <template #prepend>
                                                        <v-avatar
                                                            size="42"
                                                            rounded="lg"
                                                            class="gradient-primary mr-3 text-caption font-weight-bold"
                                                        >
                                                            <v-img v-if="organization.logoUrl" :src="organization.logoUrl" />
                                                            <span v-else>{{ getInitials(organization.name) }}</span>
                                                        </v-avatar>
                                                    </template>

                                                    <v-list-item-title class="text-body-2 font-weight-medium">
                                                        {{ organization.name }}
                                                    </v-list-item-title>

                                                    <template #append>
                                                        <em>{{ $date.format(organization.createdAt, 'dd LLL yyyy') }}</em>
                                                    </template>
                                                </v-list-item>
                                            </template>
                                        </v-list>
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-card-text v-else class="text-medium-emphasis text-caption">Aucune organisation.</v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </template>
    </v-row>
</template>

<script setup lang="ts">
const api = useApi();
const { $date } = useNuxtApp();

interface DashboardStats {
    users: { total: number; newThisMonth: number };
    organizations: { total: number; newThisMonth: number };
    subscriptions: {
        active: number;
        trialing: number;
        byPlan: { title: string; count: number }[];
    };
    revenue: {
        thisMonth: number;
        lastMonth: number;
        currency: string;
        last6Months: { month: string; amount: number }[];
    };
    recentOrganizations: { slug: string; name: string; logoUrl: string | null; createdAt: string }[];
}

const isLoading = computed(() => api.isLoading("dashboard:stats"));
const stats = ref<DashboardStats | null>(null);

onMounted(async () => {
    stats.value = await api.get<DashboardStats>("dashboard/stats", { loadingKey: "dashboard:stats" });
});

interface KpiCard {
    key: string;
    label: string;
    value: number;
    isCurrency?: boolean;
    color: string;
    icon: string;
    captionIcon: string;
    captionText: string;
    captionColor?: string;
}

const kpiCards = computed<KpiCard[]>(() => {
    if (!stats.value) {
        return [];
    }

    const s = stats.value;

    return [
        {
            key: "users",
            label: "Utilisateurs",
            value: s.users.total,
            color: "blue",
            icon: "mdi-account-group",
            captionIcon: "mdi-calendar-plus",
            captionText: s?.users.newThisMonth ? `+${s.users.newThisMonth} ce mois-ci` : "Aucun nouveau ce mois-ci",
        },
        {
            key: "organizations",
            label: "Organisations",
            value: s.organizations.total,
            color: "purple",
            icon: "mdi-domain",
            captionIcon: "mdi-calendar-plus",
            captionText: s.organizations.newThisMonth
                ? `+${s.organizations.newThisMonth} ce mois-ci`
                : "Aucune nouvelle ce mois-ci",
        },
        {
            key: "subscriptions",
            label: "Abonnements actifs",
            value: s.subscriptions.active,
            color: "teal",
            icon: "mdi-cube-outline",
            captionIcon: "mdi-account-clock-outline",
            captionText: s.subscriptions.trialing ? `${s.subscriptions.trialing} en essai` : "Aucun essai en cours",
        },
    ];
});

const planPercent = (count: number): number => {
    const total = stats.value?.subscriptions.byPlan.reduce((sum, plan) => sum + plan.count, 0) ?? 0;

    return total ? (count / total) * 100 : 0;
};

const months = computed(() => {
    return stats.value?.revenue.last6Months.map((item) => $date.format(`${item.month}-01`, "LLLL yyyy")) ?? [];
});

type Trend = "up" | "down" | "equal";

const TREND_META: Record<Trend, { color: string; icon: string }> = {
    up: { color: "success", icon: "mdi-arrow-up" },
    down: { color: "error", icon: "mdi-arrow-down" },
    equal: { color: "blue", icon: "mdi-equal" },
};

const trend = computed<Trend[]>(() => {
    const items = stats.value?.revenue.last6Months ?? [];

    return items.map((item, index) => {
        if (index === 0) {
            return "equal";
        }

        const previous = items[index - 1].amount;

        if (item.amount > previous) {
            return "up";
        }

        if (item.amount < previous) {
            return "down";
        }

        return "equal";
    });
});
</script>

<style scoped>
.widget-card {
    position: relative;
    overflow: hidden;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.widget-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.widget-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0.8;
}
</style>
