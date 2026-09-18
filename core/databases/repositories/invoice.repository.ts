import { dataSource } from "../../config/datasource";
import { InvoiceEntity } from "../entities/invoice.entity";
import { Equal } from "typeorm";
import { DateTime } from "luxon";

export const InvoiceRepository = dataSource.getRepository(InvoiceEntity).extend({
    async findRecentByOrganization(organizationUuid: string, limit: number): Promise<InvoiceEntity[]> {
        return this.find({
            where: {
                organizationUuid: Equal(organizationUuid)
            },
            order: {
                date: "DESC"
            },
            take: limit,
        });
    },
    async getMonthlyRevenue(monthsBack: number): Promise<{ month: string; amount: number }[]> {
        const from = DateTime.now()
            .startOf("month")
            .minus({ months: monthsBack - 1 })
            .toJSDate();

        const rows: { month: string; total: string }[] = await this.createQueryBuilder("invoice")
            .select("DATE_FORMAT(invoice.date, '%Y-%m')", "month")
            .addSelect("SUM(invoice.amount)", "total")
            .where("invoice.status = :status", { status: "paid" })
            .andWhere("invoice.date >= :from", { from })
            .groupBy("month")
            .getRawMany();

        const byMonth = new Map(rows.map((row) => [row.month, parseFloat(row.total)]));

        const result: { month: string; amount: number }[] = [];

        for (let i = monthsBack - 1; i >= 0; i--) {
            const key = DateTime.now().startOf("month").minus({ months: i }).toFormat("yyyy-MM");
            result.push({ month: key, amount: byMonth.get(key) ?? 0 });
        }

        return result;
    },
});
