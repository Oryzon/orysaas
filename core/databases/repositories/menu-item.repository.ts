import { dataSource } from "../../config/datasource";
import { MenuItemEntity } from "../entities/menu-item.entity";
import { Equal } from "typeorm";
import { MenuRepository } from "./menu.repository";

export const MenuItemRepository = dataSource.getRepository(MenuItemEntity).extend({
    async nextPosition(uuidMenu: string, uuidParent: string | null = null) {

        let lastPosition = await this.findOne({
            where: {
                menuUuid: Equal(uuidMenu),
            },
            order: {
                position: 'DESC'
            }
        });

        if (uuidParent) {
            lastPosition = await this.findOne({
                where: {
                    menuUuid: Equal(uuidMenu),
                    parentUuid: Equal(uuidParent)
                },
                order: {
                    position: 'DESC'
                }
            });
        }

        if (lastPosition) {
            return lastPosition.position + 1;
        }

        await MenuRepository.findOneOrFail({
            where: {
                uuid: Equal(uuidMenu)
            }
        });

        return 0;
    },
    async getItemToMove(uuidMenu: string, uuidParent: string, order: string, position: number) {
        let query = this.createQueryBuilder('i')
            .andWhere({ menuUuid: Equal(uuidMenu )})
        ;

        if (uuidParent) {
            query.andWhere({ parentUuid: Equal(uuidParent) });
        } else {
            query.andWhere('i.parentUuid IS NULL');
        }

        if (order === 'up') {
            query
                .andWhere('i.position < :position', { position })
                .orderBy('i.position', 'DESC');
        } else {
            query
                .andWhere('i.position > :position', { position })
                .orderBy('i.position', 'ASC');
        }

        return await query.getOne();
    }
});