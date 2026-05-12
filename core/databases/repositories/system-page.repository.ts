import { dataSource } from "../../config/datasource";
import { SystemPageEntity } from "../entities/system-page.entity";

export const SystemPageRepository = dataSource.getRepository(SystemPageEntity).extend({

});