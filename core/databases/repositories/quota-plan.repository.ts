import { dataSource } from "../../config/datasource";
import { QuotaPlanEntity } from "../entities/quota-plan.entity";

export const QuotaPlanRepository = dataSource.getRepository(QuotaPlanEntity).extend({});