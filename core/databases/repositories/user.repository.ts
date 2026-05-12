import { dataSource } from "../../config/datasource";
import { UserEntity } from "../entities/user.entity";

export const UserRepository = dataSource.getRepository(UserEntity).extend({

});