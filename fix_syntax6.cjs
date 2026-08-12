const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/\{ name: 'غسيل شامل وساطع VIP', price: 75 , \{ name: 'معطر جو فاخر واكس', price: 50 \}\]/g, "{ name: 'غسيل شامل وساطع VIP', price: 75 }, { name: 'معطر جو فاخر واكس', price: 50 }]");
code = code.replace(/\{ name: 'تلميع ساطع نانو سيراميك', price: 350 \]/g, "{ name: 'تلميع ساطع نانو سيراميك', price: 350 }]");
code = code.replace(/\{ name: 'غسيل VIP مخصوم من الاشتراك', price: 0 \]/g, "{ name: 'غسيل VIP مخصوم من الاشتراك', price: 0 }]");
code = code.replace(/if \(saved\) \{/g, 'if (saved) {');
code = code.replace(/setCards\(JSON\.parse\(saved\)\);\n\s+else \{/g, 'setCards(JSON.parse(saved));\n    } else {');

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
