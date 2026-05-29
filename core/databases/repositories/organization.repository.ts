import { dataSource } from "../../config/datasource";
import { OrganizationEntity } from "../entities/organization.entity";
import { Like } from "typeorm";

export const OrganizationRepository = dataSource.getRepository(OrganizationEntity).extend({
    async getSlug(name: string) {
        let tmpSlug = name
                                .toLowerCase()
                                .normalize('NFD')
                                .replace(/[̀-ͯ]/g, '')
                                .replace(/[^a-z0-9\s-]/g, '')
                                .trim()
                                .replace(/\s+/g, '-');

        let existing = await this.findOne({
            where: {
                slug: Like('%' + tmpSlug + '%')
            },
            order: {
                slug: "DESC"
            }
        });

        if (existing) {
            let tmpSlugTwo = existing.slug.split('_');

            if (tmpSlugTwo.length > 1) {
                tmpSlug += '_' + (Number(tmpSlugTwo[1]) + 1);
            } else {
                tmpSlug += '_1';
            }
        }

        return tmpSlug;
    }
});