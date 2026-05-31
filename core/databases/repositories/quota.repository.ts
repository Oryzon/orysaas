import { dataSource } from "../../config/datasource";
import { QuotaEntity } from "../entities/quota.entity";

export const QuotaRepository = dataSource.getRepository(QuotaEntity).extend({});
