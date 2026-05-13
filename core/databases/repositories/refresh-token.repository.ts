import { dataSource } from "../../config/datasource";
import { RefreshTokenEntity } from "../entities/refresh-token.entity";
import crypto from "crypto";
import { DateTime } from "luxon";
import { Equal, IsNull, MoreThan } from "typeorm";

export const RefreshTokenRepository = dataSource.getRepository(RefreshTokenEntity).extend({
    createClient() {
        return crypto.randomBytes(32).toString('base64url');
    },
    calculateServer(value: string) {
        return crypto.createHmac('sha256', process.env.PEPPER_REFRESH).update(value).digest('hex');
    },
    async createToken(userUuid: string) {
        let rToken = this.createClient();

        let entity = new RefreshTokenEntity();

        entity.userUuid = userUuid;
        entity.expiresAt = DateTime.now().plus({ day: 30 }).toJSDate();
        entity.token = this.calculateServer(rToken);

        await RefreshTokenRepository.insert(entity);

        return rToken;
    },
    async findValid(clientToken: string) {
        const hash = this.calculateServer(clientToken);

        return this.findOne({
            where: {
                token: Equal(hash),
                revokedAt: IsNull(),
                expiresAt: MoreThan(new Date()),
            },
        });
    },
    async revoke(clientToken: string) {
        const hash = this.calculateServer(clientToken);

        await this.update(
            { token: Equal(hash) },
            { revokedAt: DateTime.now().toJSDate() }
        );
    },
});