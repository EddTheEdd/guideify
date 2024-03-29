import knex from "@/dbConfig/knexConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";

interface RoleWithPermissions {
    roleName: string;
    permissions: string[];
}

/**
 * Gets user roles and permissions.
 * @param userId 
 * @returns 
 */
export async function getUserRolesAndPermissions(userId: number): Promise<RoleWithPermissions[]> {
    try {
        const userRoles = await knex('user_roles')
            .select('roles.name as role_name', 'permissions.name as permission_name')
            .join('roles', 'user_roles.role_id', 'roles.role_id')
            .join('role_permissions', 'roles.role_id', 'role_permissions.role_id')
            .join('permissions', 'role_permissions.permission_id', 'permissions.permission_id')
            .where('user_roles.user_id', userId);
        console.log("USER ROLES:");
        console.log(userRoles);

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
  
/**
 * Check if user has a permission
 * @param userId 
 * @param requiredPermission 
 * @returns 
 */
export async function checkUserPermissions(userId: number, requiredPermission: string) {
    const userRoles = await getUserRolesAndPermissions(userId);
    return userRoles.some((role: RoleWithPermissions) => 
      role.permissions.includes(requiredPermission)
    );
}
