const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/job_cards_\$\{currentTenantId\`/g, 'job_cards_${currentTenantId}`');
code = code.replace(/const saveCards = \(newCards: JobCard\[\]\) => \{/g, 'const saveCards = (newCards: JobCard[]) => {');
// `useEffect` closing
code = code.replace(/  , \[currentTenantId\]\);/g, '  }, [currentTenantId]);');
code = code.replace(/  ;/g, '  };');

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
