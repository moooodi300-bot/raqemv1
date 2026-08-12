const fs = require('fs');
let creatorCode = fs.readFileSync('src/components/JobCardCreator.tsx', 'utf8');

const waRegex = /const msg = `Hello \$\{card\.customerName\},[\s\S]*?Thank you\.`;/g;
const newWa = `const msg = \`Hello \${card.customerName},

Your Job Card #\${card.id} has been created successfully.
The Job Card includes the vehicle details, services, payment information, and Service Policy & Warranty.

Total: \${card.totalAmount} SAR
Remaining: \${card.remaining} SAR

Thank you.\`;`;

creatorCode = creatorCode.replace(waRegex, newWa);
fs.writeFileSync('src/components/JobCardCreator.tsx', creatorCode);
