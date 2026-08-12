const fs = require('fs');
let code = fs.readFileSync('src/lib/rbac.ts', 'utf8');

const target1 = `export function hasPermission(roleId: string, permission: Permission, tenantId?: string): boolean {
  const role = getRoles(tenantId).find(r => r.id === roleId);
  if (!role) return false;
  return role.permissions.includes(permission);
}`;

const rep1 = `export function hasPermission(roleId: string, permission: string, tenantId?: string, customPermissions?: string[] | null): boolean {
  if (customPermissions && Array.isArray(customPermissions) && customPermissions.length > 0) {
    return customPermissions.includes(permission);
  }
  const role = getRoles(tenantId).find(r => r.id === roleId);
  if (!role) return false;
  return role.permissions.includes(permission as Permission);
}`;

code = code.replace(target1, rep1);

const target2 = `export function canAccess(role: string, key: ModuleKey, tenantId?: string): boolean {
  return hasPermission(role, MODULE_PERMISSIONS[key], tenantId);
}`;

const rep2 = `export function canAccess(role: string, key: ModuleKey, tenantId?: string, customPermissions?: string[] | null): boolean {
  return hasPermission(role, MODULE_PERMISSIONS[key], tenantId, customPermissions);
}`;

code = code.replace(target2, rep2);

fs.writeFileSync('src/lib/rbac.ts', code);
