import { dataSource } from "../../config/datasource";
import { MenuEntity } from "../entities/menu.entity";
import { Equal } from "typeorm";

export const MenuRepository = dataSource.getRepository(MenuEntity).extend({
    async getPublicWithKey(key: string) {
        let menu = await this.findOne({
            where: {
                key: Equal(key),
                isActive: Equal(true),
                items: {
                    isVisible: Equal(true)
                }
            },
            relations: {
                items: true,
            },
        });

        return menu?.items ?? null;
    }
});