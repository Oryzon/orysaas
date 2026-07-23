import { dataSource } from "../../config/datasource";
import { ApiKeyEntity, ApiKeyType } from "../entities/api-key.entity";
import { ApiKeySystem } from "../../../shared/api-key-systems";
import { Equal, IsNull } from "typeorm";
import { DateTime } from "luxon";
import { decrypt } from "../../helpers/crypto.helper";

export const ApiKeyRepository = dataSource.getRepository(ApiKeyEntity).extend({
    async list(): Promise<ApiKeyEntity[]> {
        return this.find({
            where: {
                type: Equal(ApiKeyType.INTEGRATION)
            }
        });
    },
    async findBySystemKey(systemKey: ApiKeySystem): Promise<string | null> {
        const entity = await this.findOne({
            where: {
                systemKey: Equal(systemKey),
                organizationUuid: IsNull(),
            },
        });

        return entity ? decrypt(entity.value) : null;
    }
});