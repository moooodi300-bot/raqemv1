const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

// The error is on line 63: `Parsing error: ',' expected`
// Let's look around line 63.
// wait, line 62 is `        ]);          };`
// line 61 is `            { id: '4', name: 'تلميع ساطع', price: 250 },`
// Ah! `]);` and then `};` from what?
// The `if (saved) { ... } else { setCards([...]); };`
code = code.replace(/        \]\);\n          \};\n    fetchServices\(\);\n  \}, \[currentTenantId\]\);/g, `        ]);\n    }\n    fetchServices();\n  }, [currentTenantId]);`);

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
