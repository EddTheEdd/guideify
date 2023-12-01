import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";

interface RoleWithPermissions {
    roleName: string;
    permissions: string[];
}

export async function getUserRolesAndPermissions(userId: number): Promise<RoleWithPermissions[]> {
    try {
        const userRoles = await knex('user_roles')
            .select('roles.name', 'permissions.name')
            .join('roles', 'user_roles.id', 'roles.id')
            .join('role_permissions', 'roles.id', 'role_permissions.id')
            .join('permissions', 'role_permissions.id', 'permissions.id')
            .where('user_roles.user_id', userId);

        // Grouping permissions by role
        const rolesWithPermissions = userRoles.reduce((acc, { role_name, permission_name }) => {
            if (!acc[role_name]) {
                acc[role_name] = { roleName: role_name, permissions: [] };
            }
            acc[role_name].permissions.push(permission_name);
            return acc;
        }, {});

        return Object.values(rolesWithPermissions);
    } catch (error) {
        console.error("Error fetching user roles and permissions:", error);
        throw error;
    }
}
  
export async function checkUserPermissions(userId: number, requiredPermission: string) {
    const userRoles = await getUserRolesAndPermissions(userId);
    return userRoles.some((role: RoleWithPermissions) => 
      role.permissions.includes(requiredPermission)
    );
}
