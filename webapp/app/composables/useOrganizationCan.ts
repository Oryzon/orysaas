import { OrganizationMemberRole, ROLE_HIERARCHY } from "#shared/organization-roles";
export { OrganizationMemberRole };

export const useOrganizationCan = (minRole: OrganizationMemberRole): ComputedRef<boolean> => {
    const { currentOrganization } = useAuth();

    return computed(() => {
        const role = currentOrganization.value?.role;

        if (!role) {
            return false;
        }

        return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(minRole);
    });
};