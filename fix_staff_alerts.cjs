const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

code = code.replace(
  'const [formData, setFormData] = useState<Partial<Staff & { confirm_pin?: string }>>({});',
  `const [formData, setFormData] = useState<Partial<Staff & { confirm_pin?: string }>>({});\n  const [errorMsg, setErrorMsg] = useState<string | null>(null);`
);

code = code.replace(
  `  const handleEdit = (s: Staff) => {
    setEditingId(s.id);
    setFormData({ ...s, pin_code: '', confirm_pin: '', permissions: s.permissions || [] });
  };`,
  `  const handleEdit = (s: Staff) => {
    setEditingId(s.id);
    setErrorMsg(null);
    setFormData({ ...s, pin_code: '', confirm_pin: '', permissions: s.permissions || [] });
  };`
);

code = code.replace(
  `  const addNew = () => {
    setEditingId('new');
    setFormData({ name: '', role: 'worker', active: true, pin_code: '', confirm_pin: '', permissions: [] });
  };`,
  `  const addNew = () => {
    setEditingId('new');
    setErrorMsg(null);
    setFormData({ name: '', role: 'worker', active: true, pin_code: '', confirm_pin: '', permissions: [] });
  };`
);

code = code.replace(/alert\('([^']+)'\);/g, "setErrorMsg('$1');");

code = code.replace(
  `      <div className="flex gap-2 pt-4 border-t border-surface-100 justify-end">`,
  `      {errorMsg && <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg mb-4">{errorMsg}</div>}
      <div className="flex gap-2 pt-4 border-t border-surface-100 justify-end">`
);

code = code.replace(/<UserEditor/g, `<UserEditor errorMsg={errorMsg}`);

const ueTarget = `function UserEditor({ formData, setFormData, handleSave, onCancel, togglePermission }: any) {`;
const ueRep = `function UserEditor({ formData, setFormData, handleSave, onCancel, togglePermission, errorMsg }: any) {`;

code = code.replace(ueTarget, ueRep);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
