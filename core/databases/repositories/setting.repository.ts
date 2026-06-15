import { dataSource } from "../../config/datasource";
import { SettingEntity } from "../entities/setting.entity";
import { Equal } from "typeorm";

export const SettingRepository = dataSource.getRepository(SettingEntity).extend({
    async getValue(key: string) {
        let entity = await this.findOne({
            where: {
                key: Equal(key)
            }
        });

        if (!entity) {
            entity = new SettingEntity();

            entity.key = key;
            entity.value = '';

            await this.insert(entity);
        }

        return entity.value;
    },
    async setValue(key: string, value: string) {
        let entity = new SettingEntity();

        entity.key = key;
        entity.value = value;

        await this.save(entity);
    },
});