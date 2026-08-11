const fs = require('fs');
let code = fs.readFileSync('src/lib/format.ts', 'utf8');

code = code.replace(/const locale = lang === 'ar' \? 'ar-SA' : 'en-US';/g, "const locale = 'en-US'; // Force English digits everywhere");

fs.writeFileSync('src/lib/format.ts', code);
