const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

code = code.replace(
  /<UserEditor errorMsg={errorMsg}/g,
  `<UserEditor canManagePin={canManagePin} errorMsg={errorMsg}`
);

// find PIN inputs and add disabled={!canManagePin}
code = code.replace(
  `              className="pr-9 font-mono"`,
  `              className="pr-9 font-mono"
              disabled={!canManagePin}`
);

code = code.replace(
  `              className="pr-9 font-mono"`,
  `              className="pr-9 font-mono"
              disabled={!canManagePin}`
);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
