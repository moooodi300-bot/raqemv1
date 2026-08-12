const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/import type \{ Customer, JobCard  from/g, 'import type { Customer, JobCard } from');
code = code.replace(/const \{ organization, settings, activeEmployee \} \} = useAuth\(\);/g, 'const { organization, settings, activeEmployee } = useAuth();');

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
