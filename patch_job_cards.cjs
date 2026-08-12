const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

// Add import
if (!code.includes('JobCardCreator')) {
    code = code.replace("import { Search, X, MessageCircle } from 'lucide-react';", "import { Search, X, MessageCircle } from 'lucide-react';\nimport { JobCardCreator } from '@/components/JobCardCreator';");
}

// Replace Modal
const startModal = '<Modal open={showAdd} onClose={() => setShowAdd(false)} title="إنشاء كرت عمل" size="lg">';
const endModalIndex = code.indexOf('</Modal>', code.indexOf(startModal)) + 8;
const beforeModal = code.substring(0, code.indexOf(startModal));
const afterModal = code.substring(endModalIndex);

const newModal = `      <JobCardCreator 
        open={showAdd} 
        onClose={() => setShowAdd(false)} 
        currentTenantId={currentTenantId}
        customers={customers}
        availableServices={availableServices}
        settings={settings}
        onJobCardCreated={(card) => {
            saveCards([card, ...cards]);
            // the modal inside JobCardCreator will stay open for success state,
            // we let the user close it from there, which will trigger onClose
        }}
      />`;

fs.writeFileSync('src/pages/JobCardsPage.tsx', beforeModal + newModal + afterModal);
