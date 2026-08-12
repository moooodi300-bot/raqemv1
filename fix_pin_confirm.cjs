const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

const target = `    const finalPin = cleanData.pin_code ? cleanData.pin_code : staff.find(s => s.id === editingId)?.pin_code;

    const updated = isNew 
      ? [...staff, { ...cleanData, pin_code: finalPin, id: \`stf-\${Date.now()}\` } as Staff]
      : staff.map(s => s.id === editingId ? { ...s, ...cleanData, pin_code: finalPin } as Staff : s);
    
    saveStaff(updated);
    setEditingId(null);
    setFormData({});`;

const rep = `    const oldStaff = staff.find(s => s.id === editingId);
    
    if (!isNew && cleanData.pin_code && oldStaff?.pin_code && cleanData.pin_code !== oldStaff.pin_code) {
      setPinChangeConfirm({ cleanData, oldStaff });
      return;
    }

    applySave(isNew, cleanData);
  };

  const applySave = (isNew: boolean, cleanData: any) => {
    const finalPin = cleanData.pin_code ? cleanData.pin_code : staff.find(s => s.id === editingId)?.pin_code;
    const updated = isNew 
      ? [...staff, { ...cleanData, pin_code: finalPin, id: \`stf-\${Date.now()}\` } as Staff]
      : staff.map(s => s.id === editingId ? { ...s, ...cleanData, pin_code: finalPin } as Staff : s);
    
    saveStaff(updated);
    setEditingId(null);
    setFormData({});
    setPinChangeConfirm(null);
  };`;

code = code.replace(target, rep);

code = code.replace(
  `const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);`,
  `const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pinChangeConfirm, setPinChangeConfirm] = useState<any>(null);`
);

const pinDialog = `          {pinChangeConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-black text-surface-900">تغيير الرمز السري؟</h3>
                  <p className="text-surface-600 text-sm">سيتم استبدال الرمز السري الحالي للموظف.</p>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setPinChangeConfirm(null)} className="flex-1" variant="secondary">إلغاء</Button>
                    <Button onClick={() => applySave(false, pinChangeConfirm.cleanData)} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white">حفظ</Button>
                  </div>
                </div>
              </div>
            </div>
          )}`;

code = code.replace(`          {deleteConfirm && (`, pinDialog + `\n\n          {deleteConfirm && (`);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
