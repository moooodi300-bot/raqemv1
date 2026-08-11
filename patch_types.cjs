const fs = require('fs');
let code = fs.readFileSync('src/lib/types.ts', 'utf8');

code = code.replace(/notes: string \| null;/g, "notes: string | null;\n  email?: string | null;\n  customer_status?: 'active' | 'inactive' | 'vip' | 'archived' | string;\n  next_contact?: string | null;\n  notes_history?: { id: string; text: string; date: string; by: string }[];");

code = code.replace(/loyalty_target\?: number;/, "loyalty_target?: number;\n  service_policy?: string;\n  sales_target_monthly?: number;\n  sales_target_daily?: number;");

fs.writeFileSync('src/lib/types.ts', code);
