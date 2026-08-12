const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoicesPage.tsx', 'utf8');

if (!code.includes('usePermissions')) {
  code = code.replace(/import { useAuth } from '@\/lib\/auth';/, "import { useAuth, usePermissions } from '@/lib/auth';");
  code = code.replace(/const { organization, settings } = useAuth\(\);/, "const { organization, settings } = useAuth();\n  const { can } = usePermissions();");
}

code = code.replace(
  `                          {/* Refund Invoice Button */}
                          {!isRefunded && sale.total > 0 && (`,
  `                          {/* Refund Invoice Button */}
                          {!isRefunded && sale.total > 0 && can('sales.refund') && (`
);

fs.writeFileSync('src/pages/InvoicesPage.tsx', code);
