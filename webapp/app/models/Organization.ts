import type { OrganizationMember } from "./OrganizationMember";
import type { OrganizationInvite } from "./OrganizationInvite";

export interface Organization {
    uuid: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    legalForm: string;
    siret: string;
    shareCapital: string;
    nafCode: string;
    vatCode: string;
    cityRegistry: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;

    members: OrganizationMember[];
    invites: OrganizationInvite[];

    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;

    // Virtuals
    nbMembers?: number;
    role?: string;
}
