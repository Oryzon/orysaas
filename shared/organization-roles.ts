export enum OrganizationMemberRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
}

export const ROLE_HIERARCHY = [
    OrganizationMemberRole.MEMBER,
    OrganizationMemberRole.ADMIN,
    OrganizationMemberRole.OWNER,
] as const;

export const OrganizationMemberRoleLabel: Record<OrganizationMemberRole, string> = {
    [OrganizationMemberRole.OWNER]: "Propriétaire",
    [OrganizationMemberRole.ADMIN]: "Administrateur",
    [OrganizationMemberRole.MEMBER]: "Membre",
};

export const OrganizationMemberRoleColor: Record<OrganizationMemberRole, string> = {
    [OrganizationMemberRole.OWNER]: "primary",
    [OrganizationMemberRole.ADMIN]: "blue",
    [OrganizationMemberRole.MEMBER]: "red",
};