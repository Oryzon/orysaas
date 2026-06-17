import { dataSource } from "../../config/datasource";
import { OrganizationInviteEntity } from "../entities/organization-invite.entity";
import { Equal, IsNull, MoreThan } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { DateTime } from "luxon";
import { OrganizationMemberRepository } from "./organization-member.repository";
import { OrganizationMemberEntity } from "../entities/organization-member.entity";

export const OrganizationInviteRepository = dataSource.getRepository(OrganizationInviteEntity).extend({
    async findByToken(token: string): Promise<OrganizationInviteEntity | null> {
        return this.findOne({
            where: { token: Equal(token) },
            relations: { organization: true },
        });
    },
    async findPending(email: string, organizationUuid: string): Promise<OrganizationInviteEntity | null> {
        return this.findOne({
            where: {
                email: Equal(email),
                organizationUuid: Equal(organizationUuid),
                acceptedAt: IsNull(),
            },
        });
    },
    async findPendingByOrganization(organizationUuid: string): Promise<OrganizationInviteEntity[]> {
        return this.find({
            where: {
                organizationUuid: Equal(organizationUuid),
                acceptedAt: IsNull(),
                expiresAt: MoreThan(DateTime.now().toJSDate()),
            },
            order: { createdAt: 'DESC' },
        });
    },
    async acceptPendingInvites(user: UserEntity) {
        const pendingInvites = await this.find({
            where: {
                email: Equal(user.email),
                acceptedAt: IsNull(),
            },
        });

        for (const invite of pendingInvites) {
            if (DateTime.now().toJSDate() > invite.expiresAt) { // Check expiry
                continue;
            }

            const existingMember = await OrganizationMemberRepository.findOne({
                where: {
                    organizationUuid: Equal(invite.organizationUuid),
                    memberUuid: Equal(user.uuid),
                },
            });

            if (!existingMember) {
                const member = new OrganizationMemberEntity();

                member.organizationUuid = invite.organizationUuid;
                member.memberUuid = user.uuid;
                member.role = invite.role;

                await OrganizationMemberRepository.save(member);
            }

            invite.acceptedAt = DateTime.now().toJSDate();

            await OrganizationInviteRepository.save(invite);
        }
    }
});