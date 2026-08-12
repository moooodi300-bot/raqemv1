const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/const \{ can  = usePermissions\(\);/g, 'const { can } = usePermissions();');

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
