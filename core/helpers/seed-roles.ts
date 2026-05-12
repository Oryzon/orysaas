import { PermissionRepository } from "../databases/repositories/permission.repository";
import { RoleRepository } from "../databases/repositories/role.repository";
import { Equal } from "typeorm";
import { RoleEntity } from "../databases/entities/role.entity";

export const DEFAULT_ROLES: {
    name: string;
    description: string;
    permissions: string[]; // liste de permissionKey
}[] = [
    {
        name: 'SUPER ADMIN',
        description: 'Full access to everything.',
        permissions: ['*'],
    },
];

export async function seedRoles() {
    console.log('🌱 Seeding default roles...');

    // Récupérer toutes les permissions existantes en base
    const allPermissions = await PermissionRepository.find();

    for (const roleConfig of DEFAULT_ROLES) {
        let role = await RoleRepository.findOne({
            where: {
                name: Equal(roleConfig.name)
            },
            relations: {
                permissions: true
            },
        });

        if (!role) {
            role = new RoleEntity();

            role.name = roleConfig.name;
            role.description = roleConfig.description;
            role.isDeletable = false;
            role.isActive = true;

            console.log(`  ✅ Role created: ${role.name}`);
        } else {
            console.log(`  ✏️  Role already exists, updating permissions: ${role.name}`);
        }

        // Wildcard = toutes les permissions
        if (roleConfig.permissions.includes('*')) {
            role.permissions = allPermissions;
        } else {
            role.permissions = allPermissions.filter((p) =>
                roleConfig.permissions.includes(p.key)
            );
        }

        await RoleRepository.save(role);
    }

    console.log('✅ Default roles seeded.');
}
