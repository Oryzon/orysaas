import { dataSource } from "../../config/datasource";
import { v4 as uuidv4 } from "uuid";
import { PlanEntity } from "../entities/plan.entity";

export const PlanRepository = dataSource.getRepository(PlanEntity).extend({
    async createKey(): Promise<string> {
        const key = uuidv4();
        const existingPlan = await this.findOne({ where: { uniqueKey: key } });

        if (existingPlan) {
            return this.createKey();
        }

        return key;
    },
});
