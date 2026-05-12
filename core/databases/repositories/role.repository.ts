import { dataSource } from "../../config/datasource";
import { RoleEntity } from "../entities/role.entity";

export const RoleRepository = dataSource.getRepository(RoleEntity).extend({

});