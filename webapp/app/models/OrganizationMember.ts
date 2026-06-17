import type { Organization } from "~/models/Organization";
import type { User } from "~/models/User";
export { OrganizationMemberRole, OrganizationMemberRoleLabel, OrganizationMemberRoleColor } from "#shared/organization-roles";
import type { OrganizationMemberRole } from "#shared/organization-roles";

export interface OrganizationMember {
    uuid: string;
    organizationUuid: string;
    organization: Organization;
    memberUuid: string;
    member: User;
    role: OrganizationMemberRole;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}