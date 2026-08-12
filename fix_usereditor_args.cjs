const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

code = code.replace(
  `function UserEditor({ formData, setFormData, handleSave, onCancel, togglePermission, errorMsg }: any) {`,
  `function UserEditor({ formData, setFormData, handleSave, onCancel, togglePermission, errorMsg, canManagePin }: any) {`
);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
