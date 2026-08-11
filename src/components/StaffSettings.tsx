import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Label, Badge } from '@/components/ui';
import { Edit, Save, X, Trash2, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { Staff } from '@/lib/types';
import { canAccess } from '@/lib/rbac';

export function StaffSettings() {
  const { organization, role } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const tenantId = organization?.id || 'org_client_01';

  const canManagePin = canAccess(role, 'settings', tenantId); // We assume settings access gives staff access, or create a specific perm

  useEffect(() => {
    const saved = localStorage.getItem(`tenant_staff_${tenantId}`);
    if (saved) {
      setStaff(JSON.parse(saved));
    }
  }, [tenantId]);

  const saveStaff = (newStaff: Staff[]) => {
    setStaff(newStaff);
    localStorage.setItem(`tenant_staff_${tenantId}`, JSON.stringify(newStaff));
  };

  const handleEdit = (s: Staff) => {
    setEditingId(s.id);
    setFormData({ ...s, pin_code: '' }); // Don't show old PIN
  };

  const handleSave = () => {
    if (!editingId) return;
    const isNew = editingId === 'new';
    
    // Validate PIN if it's new or if they entered one
    if (isNew && !formData.pin_code) {
      alert('الرجاء إدخال رمز PIN');
      return;
    }

    const updated = isNew 
      ? [...staff, { ...formData, id: `stf-${Date.now()}` } as Staff]
      : staff.map(s => s.id === editingId ? { ...s, ...formData, pin_code: formData.pin_code || s.pin_code } : s);
    
    saveStaff(updated);
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };
  const confirmDelete = () => {
    if (deleteConfirm) {
      saveStaff(staff.filter(s => s.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const addNew = () => {
    setEditingId('new');
    setFormData({ name: '', role: 'worker', active: true, pin_code: '' });
  };

  if (!canManagePin) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded-lg">ليس لديك صلاحية لإدارة الموظفين وأرقام PIN.</div>;
  }

  return (
    <Card>
      <CardBody className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-surface-800">إدارة الموظفين (PIN)</h3>
          <Button onClick={addNew} size="sm">إضافة موظف</Button>
        </div>
        
        <div className="space-y-4">
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
          )}
          {staff.map(s => (
            <div key={s.id} className="p-4 border rounded-xl bg-surface-50 flex items-center justify-between">
              {editingId === s.id ? (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>اسم الموظف</Label>
                      <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <Label>الصلاحية (الدور)</Label>
                      <select 
                        className="w-full border-surface-300 rounded-lg h-10"
                        value={formData.role || ''} 
                        onChange={e => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="owner">مالك (Owner)</option>
                        <option value="manager">مدير (Manager)</option>
                        <option value="cashier">كاشير (Cashier)</option>
                        <option value="accountant">محاسب (Accountant)</option>
                        <option value="worker">عامل (Worker)</option>
                      </select>
                    </div>
                    <div>
                      <Label>رمز الدخول (PIN)</Label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute right-3 top-3 text-surface-400" />
                        <Input 
                          type="password" 
                          placeholder={s.id === 'new' ? "أدخل الرمز" : "اتركه فارغاً للاحتفاظ بالسابق"} 
                          className="pr-9"
                          maxLength={6}
                          value={formData.pin_code || ''} 
                          onChange={e => setFormData({...formData, pin_code: e.target.value.replace(/\D/g,'')})} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                      <span className="font-bold">حساب نشط</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Save className="w-4 h-4" /> حفظ</Button>
                    <Button onClick={() => setEditingId(null)} size="sm" variant="secondary"><X className="w-4 h-4" /> إلغاء</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-surface-800 flex items-center gap-2">
                        {s.name}
                        {!s.active && <Badge tone="red">غير نشط</Badge>}
                      </h4>
                      <p className="text-xs text-surface-500">{s.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleEdit(s)} size="sm" variant="outline"><Edit className="w-4 h-4" /> تعديل</Button>
                    {s.role !== 'owner' && (
                      <Button onClick={() => handleDelete(s.id)} size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50 border-rose-200">
                        <Trash2 className="w-4 h-4" /> حذف
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          {editingId === 'new' && (
            <div className="p-4 border rounded-xl bg-surface-50 flex items-center justify-between border-primary-300 shadow-sm">
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>اسم الموظف</Label>
                      <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <Label>الصلاحية (الدور)</Label>
                      <select 
                        className="w-full border-surface-300 rounded-lg h-10"
                        value={formData.role || ''} 
                        onChange={e => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="owner">مالك (Owner)</option>
                        <option value="manager">مدير (Manager)</option>
                        <option value="cashier">كاشير (Cashier)</option>
                        <option value="accountant">محاسب (Accountant)</option>
                        <option value="worker">عامل (Worker)</option>
                      </select>
                    </div>
                    <div>
                      <Label>رمز الدخول (PIN)</Label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute right-3 top-3 text-surface-400" />
                        <Input 
                          type="password" 
                          placeholder="أدخل الرمز"
                          className="pr-9"
                          maxLength={6}
                          value={formData.pin_code || ''} 
                          onChange={e => setFormData({...formData, pin_code: e.target.value.replace(/\D/g,'')})} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                      <span className="font-bold">حساب نشط</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Save className="w-4 h-4" /> حفظ</Button>
                    <Button onClick={() => setEditingId(null)} size="sm" variant="secondary"><X className="w-4 h-4" /> إلغاء</Button>
                  </div>
                </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
