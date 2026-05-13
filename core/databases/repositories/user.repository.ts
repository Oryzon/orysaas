import { dataSource } from "../../config/datasource";
import { UserEntity } from "../entities/user.entity";
import * as jwt from "jsonwebtoken";

export const UserRepository = dataSource.getRepository(UserEntity).extend({
    generateJwtToken(user: UserEntity) {
        let expiry = "2h";

        const token = jwt.sign(
            {
                uuid: user.uuid,
                username: user.email,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: expiry
            });

        return token;
    }
});