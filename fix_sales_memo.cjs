const fs = require('fs');
let code = fs.readFileSync('src/pages/SalesPage.tsx', 'utf8');

const target = `}, [customerSearch, allCustomersRef.current]);`;
const replacement = `}, [customerSearch, customers]);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/SalesPage.tsx', code);
