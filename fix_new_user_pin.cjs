const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

code = code.replace(
  `{canManagePin ? (`,
  `{(canManagePin || !formData.id) ? (`
);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
