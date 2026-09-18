import { dataSource } from "../../config/datasource";
import { OrganizationMemberEntity, OrganizationMemberRole } from "../entities/organization-member.entity";
import { Equal, IsNull } from "typeorm";
import { OrganizationEntity } from "../entities/organization.entity";

export const OrganizationMemberRepository = dataSource.getRepository(OrganizationMemberEntity).extend({
    async classifyOwnedOrganizationsForDeletion(
        userUuid: string,
    ): Promise<{ blocking: OrganizationEntity[]; cascadable: OrganizationEntity[] }> {
        const ownedMemberships = await this.find({
            where: {
                memberUuid: Equal(userUuid),
                role: Equal(OrganizationMemberRole.OWNER),
            },
            relations: { organization: true },
        });

        const blocking: OrganizationEntity[] = [];
        const cascadable: OrganizationEntity[] = [];

        if (ownedMemberships.length === 0) {
            return {
                blocking,
                cascadable
            };
        }

        const organizationUuids = ownedMemberships.map((membership) => membership.organizationUuid);

        const rows: {
            organizationUuid: string;
            total: string;
            ownerCount: string
        }[] = await this
            .createQueryBuilder("member",)
            .select("member.organizationUuid", "organizationUuid")
            .addSelect("COUNT(*)", "total")
            .addSelect("SUM(CASE WHEN member.role = :ownerRole THEN 1 ELSE 0 END)", "ownerCount")
            .where("member.organizationUuid IN (:...organizationUuids)", { organizationUuids })
            .setParameter("ownerRole", OrganizationMemberRole.OWNER)
            .groupBy("member.organizationUuid")
            .getRawMany();

        const statsByOrg = new Map(
            rows.map((row) => [
                row.organizationUuid,
                { total: parseInt(row.total, 10), ownerCount: parseInt(row.ownerCount, 10) },
            ]),
        );

        for (const membership of ownedMemberships) {
            const stats = statsByOrg.get(membership.organizationUuid) ?? { total: 1, ownerCount: 1 };

            if (stats.ownerCount > 1) {
                continue;
            }

            if (stats.total === 1) {
                cascadable.push(membership.organization);
            } else {
                blocking.push(membership.organization);
            }
        }

        return {
            blocking,
            cascadable
        };
    },
    async findLight(userUuid: string) {
        const orga = await this.findOne({
            where: {
                memberUuid: Equal(userUuid),
            },
            order: {
                createdAt: "ASC",
            },
            relations: {
                organization: true,
            },
        });

        let countMember = 0;

        if (orga) {
            countMember = await OrganizationMemberRepository.count({
                where: {
                    organizationUuid: Equal(orga.organizationUuid),
                },
            });
        }

        return {
            slug: orga?.organization?.slug ?? null,
            name: orga?.organization?.name ?? null,
            logoUrl: orga?.organization?.logoUrl ?? null,
            nbMembers: countMember,
            role: orga?.role ?? null,
        };
    },
    async findLightBySlug(userUuid: string, slug: string) {
        const orga = await this.findOne({
            where: {
                memberUuid: Equal(userUuid),
                organization: { slug: Equal(slug) },
            },
            relations: {
                organization: true,
            },
        });

        if (!orga) {
            return null;
        }

        const nbMembers = await OrganizationMemberRepository.count({
            where: {
                organizationUuid: Equal(orga.organizationUuid),
            },
        });

        return {
            slug: orga.organization.slug,
            name: orga.organization.name,
            logoUrl: orga.organization.logoUrl,
            nbMembers,
            role: orga.role,
        };
    },
    async findAll(userUuid: string) {
        const orgas = await this.find({
            where: {
                memberUuid: Equal(userUuid),
            },
            order: {
                createdAt: "ASC",
            },
            relations: {
                organization: true,
            },
        });

        if (orgas.length === 0) {
            return [];
        }

        const organizationUuids = orgas.map((orga) => orga.organizationUuid);

        const rows: {
            organizationUuid: string;
            count: string
        }[] = await this.createQueryBuilder("member")
            .select("member.organizationUuid", "organizationUuid")
            .addSelect("COUNT(*)", "count")
            .where("member.organizationUuid IN (:...organizationUuids)", { organizationUuids })
            .groupBy("member.organizationUuid")
            .getRawMany();

        const countByOrg = new Map(rows.map((row) => [row.organizationUuid, parseInt(row.count, 10)]));

        return orgas.map((orga: OrganizationMemberEntity) => ({
            uuid: orga.organization.uuid,
            slug: orga.organization.slug,
            name: orga.organization.name,
            logoUrl: orga.organization.logoUrl,
            role: orga.role,
            nbMembers: countByOrg.get(orga.organizationUuid) ?? 0,
        }));
    },
});
