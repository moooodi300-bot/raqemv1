const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

code = code.replace(
  `  const canManagePin = canAccess(role, 'settings' /* fallback */, tenantId, activeEmployee?.permissions) || activeEmployee?.permissions?.includes('settings.manage_pin');`,
  `  const canManagePin = hasPermission(role, 'settings.manage_pin', tenantId, activeEmployee?.permissions) || role === 'owner' || role === 'manager';`
);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
