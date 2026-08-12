const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

// Undo the duplicate
code = code.replace(
  `              className="pr-9 font-mono"
              disabled={!canManagePin}
              disabled={!canManagePin}`,
  `              className="pr-9 font-mono"
              disabled={!canManagePin}`
);

// Apply to the second input
code = code.replace(
  `              className="pr-9 font-mono"
              maxLength={6}
              value={formData.confirm_pin || ''}`,
  `              className="pr-9 font-mono"
              disabled={!canManagePin}
              maxLength={6}
              value={formData.confirm_pin || ''}`
);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
