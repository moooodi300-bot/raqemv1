const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomersPage.tsx', 'utf8');

// We need an EditCustomerModal state and logic
const addEditModalTarget = `<Modal open={showAdd} onClose={() => setShowAdd(false)} title={tr('newCustomer', lang)}>`;
const addEditModalReplacement = `
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="تعديل بيانات العميل">
        {(() => {
           const c = customers.find(x => x.id === showEdit);
           if (!c) return null;
           return (
             <div className="space-y-3">
               <div><Label>اسم العميل *</Label><Input defaultValue={c.name} id="edit-name" /></div>
               <div><Label>رقم الجوال</Label><Input defaultValue={c.phone || ''} id="edit-phone" dir="ltr" /></div>
               <div><Label>البريد الإلكتروني</Label><Input defaultValue={c.email || ''} id="edit-email" dir="ltr" /></div>
               <div><Label>رقم اللوحة</Label><Input defaultValue={c.plate_number || ''} id="edit-plate" /></div>
               <div className="grid grid-cols-2 gap-2">
                 <div><Label>نوع المركبة</Label><Input defaultValue={c.vehicle_type || ''} id="edit-vtype" /></div>
                 <div><Label>لون المركبة</Label><Input defaultValue={c.vehicle_color || ''} id="edit-vcolor" /></div>
               </div>
               <div><Label>حالة العميل</Label>
                 <Select defaultValue={c.customer_status || 'active'} id="edit-status">
                   <option value="active">نشط</option>
                   <option value="inactive">غير نشط</option>
                   <option value="vip">VIP</option>
                 </Select>
               </div>
               <div><Label>تاريخ التواصل القادم</Label><Input type="date" defaultValue={c.next_contact ? c.next_contact.split('T')[0] : ''} id="edit-contact" /></div>
               <Button onClick={() => {
                  const updated = customers.map(x => {
                    if (x.id === c.id) {
                      return {
                        ...x,
                        name: (document.getElementById('edit-name') as HTMLInputElement).value,
                        phone: (document.getElementById('edit-phone') as HTMLInputElement).value,
                        email: (document.getElementById('edit-email') as HTMLInputElement).value,
                        plate_number: (document.getElementById('edit-plate') as HTMLInputElement).value,
                        vehicle_type: (document.getElementById('edit-vtype') as HTMLInputElement).value,
                        vehicle_color: (document.getElementById('edit-vcolor') as HTMLInputElement).value,
                        customer_status: (document.getElementById('edit-status') as HTMLSelectElement).value,
                        next_contact: (document.getElementById('edit-contact') as HTMLInputElement).value,
                        updated_at: new Date().toISOString()
                      };
                    }
                    return x;
                  });
                  setCustomers(updated);
                  localStorage.setItem(\`tenant_customers_\${currentTenantId}\`, JSON.stringify(updated));
                  // show a professional toast here ideally
                  alert('تم حفظ بيانات العميل بنجاح ✓');
                  setShowEdit(null);
               }} className="w-full mt-4">حفظ التعديلات</Button>
             </div>
           );
        })()}
      </Modal>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={tr('newCustomer', lang)}>`;

code = code.replace(addEditModalTarget, addEditModalReplacement);

// Add the Notes section to the Profile View. Let's find where the History tabs are in the Profile View.
const historyTabsTarget = `<div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
            {['sales', 'subscriptions', 'jobcards'].map((tab) => (`;
const historyTabsReplacement = `<div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
            {['sales', 'subscriptions', 'jobcards', 'notes'].map((tab) => (`;
code = code.replace(historyTabsTarget, historyTabsReplacement);

// Add translation for 'notes' tab or just hardcode it
const tabNamesTarget = `{tab === 'sales' && tr('salesAndInvoices', lang)}`;
const tabNamesReplacement = `{tab === 'sales' && tr('salesAndInvoices', lang)}
             {tab === 'notes' && 'الملاحظات والمتابعة'}`;
code = code.replace(tabNamesTarget, tabNamesReplacement);

// Add the rendering of notes
const tabContentTarget = `</div>
          </div>
        </div>
      </div>
    );
  }`;
const tabContentReplacement = `
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Input placeholder="أضف ملاحظة جديدة..." id="new-note-text" className="flex-1" />
                  <Button onClick={() => {
                    const txt = (document.getElementById('new-note-text') as HTMLInputElement).value;
                    if(!txt.trim()) return;
                    const staffName = localStorage.getItem('saas_staff_name') || 'موظف'; // fallback
                    const newNote = { id: Date.now().toString(), text: txt, date: new Date().toISOString(), by: staffName };
                    const updated = customers.map(c => c.id === profileCustomer.id ? { ...c, notes_history: [...(c.notes_history || []), newNote] } : c);
                    setCustomers(updated);
                    localStorage.setItem(\`tenant_customers_\${currentTenantId}\`, JSON.stringify(updated));
                    (document.getElementById('new-note-text') as HTMLInputElement).value = '';
                  }}>إضافة ملاحظة</Button>
                </div>
                <div className="space-y-3">
                  {profileCustomer.notes_history && profileCustomer.notes_history.length > 0 ? (
                    profileCustomer.notes_history.map(n => (
                      <div key={n.id} className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                        <p className="text-surface-800 font-medium">{n.text}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-surface-500">
                           <span>بواسطة: {n.by}</span>
                           <span>{new Date(n.date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    )).reverse()
                  ) : (
                    <EmptyState message="لا توجد ملاحظات سابقة" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }`;
code = code.replace(tabContentTarget, tabContentReplacement);

fs.writeFileSync('src/pages/CustomersPage.tsx', code);
