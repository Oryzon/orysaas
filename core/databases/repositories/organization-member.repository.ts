import { dataSource } from "../../config/datasource";
import { OrganizationMemberEntity } from "../entities/organization-member.entity";
import { Equal, IsNull } from "typeorm";

export const OrganizationMemberRepository = dataSource.getRepository(OrganizationMemberEntity).extend({
    async findLight(userUuid: string) {
        const orga = await this.findOne({
            where: {
                memberUuid: Equal(userUuid)
            },
            order: {
                createdAt: "ASC"
            },
            relations: {
                organization: true
            },
        });

        let countMember = 0;

        if (orga) {
            countMember = await OrganizationMemberRepository.count({
                where: {
                    organizationUuid: Equal(orga.organizationUuid)
                }
            });
        }

        return {
            slug: orga?.organization?.slug ?? null,
            name: orga?.organization?.name ?? null,
            logoUrl: orga?.organization?.logoUrl ?? null,
            nbMembers: countMember,
            role: orga?.role ?? null,
        }
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
                organizationUuid: Equal(orga.organizationUuid)
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
                memberUuid: Equal(userUuid)
            },
            order: {
                createdAt: "ASC"
            },
            relations: {
                organization: true
            },
        });

        return Promise.all(orgas.map(async (orga: OrganizationMemberEntity) => {
            const nbMembers = await OrganizationMemberRepository.count({
                where: {
                    organizationUuid: Equal(orga.organizationUuid)
                },
            });

            return {
                uuid: orga.organization.uuid,
                slug: orga.organization.slug,
                name: orga.organization.name,
                logoUrl: orga.organization.logoUrl,
                role: orga.role,
                nbMembers,
            };
        }));
    }
})