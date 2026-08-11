const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomersPage.tsx', 'utf8');

// We need to add a state for confirming archive
const stateTarget = `const [showEdit, setShowEdit] = useState<string | null>(null);`;
const stateReplacement = `const [showEdit, setShowEdit] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);`;
code = code.replace(stateTarget, stateReplacement);

const handleArchiveTarget = `const handleBulkArchive = () => {
    // In a real app we would show a nice dialog and then set customer_status = 'archived'
    if(window.confirm('أرشفة العملاء المحددين؟')) {
       // logic here
       setSelectedIds([]);
    }
  };`;
const handleArchiveReplacement = `const handleBulkArchive = () => {
    setShowArchiveConfirm(true);
  };
  const confirmArchive = () => {
    const updated = customers.map(c => {
      if (selectedIds.includes(c.id)) {
        return { ...c, customer_status: 'archived', updated_at: new Date().toISOString() };
      }
      return c;
    });
    setCustomers(updated);
    localStorage.setItem(\`tenant_customers_\${currentTenantId}\`, JSON.stringify(updated));
    setSelectedIds([]);
    setShowArchiveConfirm(false);
  };`;
code = code.replace(handleArchiveTarget, handleArchiveReplacement);

const jsxTarget = `<Modal open={!!showEdit}`;
const jsxReplacement = `<Modal open={showArchiveConfirm} onClose={() => setShowArchiveConfirm(false)} title="أرشفة العملاء؟">
        <div className="space-y-4">
          <p className="text-surface-600 text-sm">سيتم نقل العملاء المحددين إلى الأرشيف. لن يتم حذف سجلاتهم التاريخية والفواتير الخاصة بهم حفاظاً على البيانات المالية.</p>
          <div className="flex gap-2 pt-4">
            <Button onClick={confirmArchive} className="w-full bg-rose-600 hover:bg-rose-700 text-white">نعم، أرشفة</Button>
            <Button onClick={() => setShowArchiveConfirm(false)} className="w-full" variant="secondary">إلغاء</Button>
          </div>
        </div>
      </Modal>
      <Modal open={!!showEdit}`;
code = code.replace(jsxTarget, jsxReplacement);

fs.writeFileSync('src/pages/CustomersPage.tsx', code);

// Now fix StaffSettings
let staffCode = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');
const staffStateTarget = `const [formData, setFormData] = useState<Partial<Staff>>({});`;
const staffStateReplacement = `const [formData, setFormData] = useState<Partial<Staff>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);`;
staffCode = staffCode.replace(staffStateTarget, staffStateReplacement);

const staffDeleteTarget = `const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      saveStaff(staff.filter(s => s.id !== id));
    }
  };`;
const staffDeleteReplacement = `const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };
  const confirmDelete = () => {
    if (deleteConfirm) {
      saveStaff(staff.filter(s => s.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };`;
staffCode = staffCode.replace(staffDeleteTarget, staffDeleteReplacement);

const staffJsxTarget = `<div className="space-y-4">`;
const staffJsxReplacement = `<div className="space-y-4">
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-black text-surface-900">حذف الموظف؟</h3>
                  <p className="text-surface-600 text-sm">هل أنت متأكد من حذف هذا الموظف؟ لن يتمكن من تسجيل الدخول للنظام بعد الآن.</p>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={confirmDelete} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white">نعم، حذف</Button>
                    <Button onClick={() => setDeleteConfirm(null)} className="flex-1" variant="secondary">إلغاء</Button>
                  </div>
                </div>
              </div>
            </div>
          )}`;
staffCode = staffCode.replace(staffJsxTarget, staffJsxReplacement);

fs.writeFileSync('src/components/StaffSettings.tsx', staffCode);
