import type { Organization } from "~/models/Organization";
import type { OrganizationMemberRole } from "~/models/OrganizationMember";

export interface OrganizationInvite {
    uuid: string;
    organizationUuid: string;
    organization: Organization;
    email: string;
    role: OrganizationMemberRole;
    token: string;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}