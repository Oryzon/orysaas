import { dataSource } from "../../config/datasource";
import { BlockEntity } from "../entities/block.entity";

export const BlockRepository = dataSource.getRepository(BlockEntity).extend({

});