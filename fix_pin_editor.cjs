const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

// Add canManagePin to UserEditor component definition
code = code.replace(
  `function UserEditor({ formData, setFormData, handleSave, onCancel, togglePermission, errorMsg }: any) {`,
  `function UserEditor({ formData, setFormData, handleSave, onCancel, togglePermission, errorMsg, canManagePin }: any) {`
);

// Disable the PIN fields if !canManagePin
code = code.replace(
  `        <div>
          <Label>رمز الدخول (PIN)</Label>`,
  `        <div>
          <Label>رمز الدخول (PIN)</Label>`
);

// I need to use regex to inject disabled property.
