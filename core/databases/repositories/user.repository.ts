import { dataSource } from "../../config/datasource";
import { UserEntity } from "../entities/user.entity";
import * as jwt from "jsonwebtoken";

export const UserRepository = dataSource.getRepository(UserEntity).extend({
    generateJwtToken(user: UserEntity) {
        const token = jwt.sign(
            {
                uuid: user.uuid,
                username: user.email,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return token;
    }
});