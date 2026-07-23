import { dataSource } from "../../config/datasource";
import { PlanPriceEntity } from "../entities/plan-price.entity";

export const PlanPriceRepository = dataSource.getRepository(PlanPriceEntity).extend({

});