const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');
code = code.replace(/    \};\n    fetchServices\(\);\n    \}\n  \}, \[currentTenantId\]\);/g, 
`    };
    fetchServices();
  }, [currentTenantId]);`);
fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
