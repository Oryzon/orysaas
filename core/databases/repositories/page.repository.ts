import { dataSource } from "../../config/datasource";
import { PageEntity } from "../entities/page.entity";

export const PageRepository = dataSource.getRepository(PageEntity).extend({

});
