import { dataSource } from "../../config/datasource";
import { v4 as uuidv4 } from "uuid";
import { PlanEntity } from "../entities/plan.entity";
import { Brackets, Like } from "typeorm";

type PlanSearchFilters = {
    search?: string;
    title?: string;
    description?: string;
    isActive?: boolean;
};

export const PlanRepository = dataSource.getRepository(PlanEntity).extend({
    async getSlug(title: string) {
        let tmpSlug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        let existing = await this.findOne({
            where: {
                slug: Like("%" + tmpSlug + "%"),
            },
            order: {
                slug: "DESC",
            },
        });

        if (existing) {
            let tmpSlugTwo = existing.slug.split("_");

            if (tmpSlugTwo.length > 1) {
                tmpSlug += "_" + (Number(tmpSlugTwo[1]) + 1);
            } else {
                tmpSlug += "_1";
            }
        }

        return tmpSlug;
    },

    async filterWithSearch(filters?: PlanSearchFilters): Promise<PlanEntity[]> {
        const normalizedSearch = filters?.search?.trim();
        const normalizedTitle = filters?.title?.trim();
        const normalizedDescription = filters?.description?.trim();
        const hasActiveFilter = typeof filters?.isActive === "boolean";

        if (!normalizedSearch && !normalizedTitle && !normalizedDescription && !hasActiveFilter) {
            return this.find();
        }

        const queryBuilder = this.createQueryBuilder("plan");

        if (hasActiveFilter) {
            queryBuilder.andWhere("plans.isActive = :isActive", { isActive: filters.isActive });
        }

        if (normalizedTitle) {
            queryBuilder.andWhere("LOWER(plans.title) LIKE :title", {
                title: `%${normalizedTitle.toLowerCase()}%`,
            });
        }

        if (normalizedDescription) {
            queryBuilder.andWhere("LOWER(plans.description) LIKE :description", {
                description: `%${normalizedDescription.toLowerCase()}%`,
            });
        }

        if (normalizedSearch) {
            const keyword = `%${normalizedSearch.toLowerCase()}%`;

            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where("LOWER(plans.title) LIKE :keyword", { keyword }).orWhere("LOWER(plans.description) LIKE :keyword", { keyword });
                }),
            );
        }

        return queryBuilder.getMany();
    },
});
