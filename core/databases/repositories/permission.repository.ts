import { dataSource } from "../../config/datasource";
import { PermissionEntity } from "../entities/permission.entity";

export const PermissionRepository = dataSource.getRepository(PermissionEntity).extend({

});