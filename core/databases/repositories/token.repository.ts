import { dataSource } from "../../config/datasource";
import { TokenEntity, TokenType } from "../entities/token.entity";
import { UserEntity } from "../entities/user.entity";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";

export const TokenRepository = dataSource.getRepository(TokenEntity).extend({

    async createToken(user: UserEntity, type: TokenType, expiresInHours = 24): Promise<TokenEntity> {
        const token = new TokenEntity();
        token.token = uuidv4();
        token.type = type;
        token.user = user;
        token.expiresAt = DateTime.now().plus({ hours: expiresInHours }).toJSDate();

        return this.save(token);
    },

    async findValid(token: string, type: TokenType): Promise<TokenEntity | null> {
        return this.findOne({
            where: { token, type },
            relations: ['user'],
        });
    },

    async markAsUsed(token: TokenEntity): Promise<void> {
        token.usedAt = DateTime.now().toJSDate();
        await this.save(token);
    },

});