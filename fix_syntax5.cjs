const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/accounts_transactions_\$\{currentTenantId\`/g, 'accounts_transactions_${currentTenantId}`');
code = code.replace(/tenant_sales_\$\{currentTenantId\`/g, 'tenant_sales_${currentTenantId}`');
code = code.replace(/إيراد غسيل - كرت \$\{id\`/g, 'إيراد غسيل - كرت ${id}`');
code = code.replace(/sale-\$\{Date\.now\(\)\`/g, 'sale-${Date.now()}`');

// also `transactions.push({...);` should be `transactions.push({...});`
code = code.replace(/        \);/g, '        });'); // Be careful! Let's be more specific.

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
