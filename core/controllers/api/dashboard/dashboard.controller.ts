import { Controller, Error, CheckJwt, CheckIsSaasAdmin, Get } from "../../../decorators";
import { Request, Response } from "express";
import { MoreThanOrEqual } from "typeorm";
import { DateTime } from "luxon";
import HttpCode from "../../../config/http-code";
import { UserRepository } from "../../../databases/repositories/user.repository";
import { OrganizationRepository } from "../../../databases/repositories/organization.repository";
import { SubscriptionRepository } from "../../../databases/repositories/subscription.repository";
import { InvoiceRepository } from "../../../databases/repositories/invoice.repository";
import { SubscriptionStatus } from "../../../../shared/subscription-status";

@Controller("dashboard")
export default class DashboardController {
    @Get("/stats")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async stats(req: Request, res: Response) {
        const startOfMonth = DateTime.now().startOf("month").toJSDate();

        const [
            totalUsers,
            newUsersThisMonth,
            totalOrganizations,
            newOrganizationsThisMonth,
            activeSubscriptions,
            trialingSubscriptions,
            byPlan,
            monthlyRevenue,
            recentOrganizations,
        ] = await Promise.all([
            UserRepository.count(),
            UserRepository.count({ where: { createdAt: MoreThanOrEqual(startOfMonth) } }),
            OrganizationRepository.count(),
            OrganizationRepository.count({ where: { createdAt: MoreThanOrEqual(startOfMonth) } }),
            SubscriptionRepository.count({ where: { status: SubscriptionStatus.ACTIVE } }),
            SubscriptionRepository.count({ where: { status: SubscriptionStatus.TRIALING } }),
            SubscriptionRepository.countByPlan(),
            InvoiceRepository.getMonthlyRevenue(6),
            OrganizationRepository.find({ order: { createdAt: "DESC" }, take: 5 }),
        ]);

        return res.status(HttpCode.OK).send({
            users: { total: totalUsers, newThisMonth: newUsersThisMonth },
            organizations: { total: totalOrganizations, newThisMonth: newOrganizationsThisMonth },
            subscriptions: { active: activeSubscriptions, trialing: trialingSubscriptions, byPlan },
            revenue: {
                thisMonth: monthlyRevenue[monthlyRevenue.length - 1]?.amount ?? 0,
                lastMonth: monthlyRevenue[monthlyRevenue.length - 2]?.amount ?? 0,
                currency: "eur",
                last6Months: monthlyRevenue,
            },
            recentOrganizations: recentOrganizations.map((organization) => ({
                slug: organization.slug,
                name: organization.name,
                logoUrl: organization.logoUrl,
                createdAt: organization.createdAt,
            })),
        });
    }
}
