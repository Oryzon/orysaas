import { dataSource } from "../../config/datasource";
import { TokenEntity, TokenType } from "../entities/token.entity";
import { UserEntity } from "../entities/user.entity";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import { Equal } from "typeorm";

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
    async createCodeToken(user: UserEntity, type: TokenType, expiresInMinutes = 15): Promise<string> {
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const token = new TokenEntity();

        token.token = `${user.uuid}:${code}`;
        token.type = type;
        token.user = user;
        token.expiresAt = DateTime.now().plus({ minutes: expiresInMinutes }).toJSDate();

        await this.save(token);

        return code;
    },
    async findValidCode(code: string, type: TokenType, userUuid: string): Promise<TokenEntity | null> {
        return this.findOne({
            where: {
                token: Equal(`${userUuid}:${code}`),
                type: Equal(type)
            },
            relations: {
                user: true
            },
        });
    },
});