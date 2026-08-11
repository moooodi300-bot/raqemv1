const fs = require('fs');

let code = fs.readFileSync('src/pages/CustomersPage.tsx', 'utf8');

const targetFiltersStart = `<div className="mb-4 relative">`;
const targetFiltersEnd = `{filtered.length === 0 && <EmptyState message={tr('noData', lang)} />}`;

const startIndex = code.indexOf(targetFiltersStart);
const endIndex = code.indexOf(targetFiltersEnd) + targetFiltersEnd.length;

const replacement = `<div className="space-y-4 mb-4">
        <div className="flex flex-wrap gap-2">
           <div className="relative flex-1 min-w-[200px]">
              <Search className={\`w-4 h-4 absolute \${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-surface-400\`} />
              <Input placeholder={tr('searchCustomers', lang)} value={search} onChange={(e) => setSearch(e.target.value)} className={isRTL ? 'pr-10' : 'pl-10'} />
           </div>
           <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="min-w-[120px]">
              <option value="all">الحالة: الكل</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="vip">VIP</option>
           </Select>
           <Select value={visitFilter} onChange={e => setVisitFilter(e.target.value)} className="min-w-[150px]">
              <option value="all">الزيارات: الكل</option>
              <option value="recent">زارنا مؤخراً</option>
              <option value="no_visit_20">انقطاع 20+ يوم</option>
              <option value="no_visit_30">انقطاع 30+ يوم</option>
              <option value="no_visit_60">انقطاع 60+ يوم</option>
           </Select>
           <Select value={subFilter} onChange={e => setSubFilter(e.target.value)} className="min-w-[150px]">
              <option value="all">الاشتراك: الكل</option>
              <option value="active">اشتراك نشط</option>
              <option value="expired">اشتراك منتهي</option>
              <option value="none">بدون اشتراك</option>
           </Select>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="bg-primary-50 border border-primary-200 p-2 rounded-xl flex items-center justify-between">
            <span className="text-sm font-bold text-primary-700">تم تحديد {selectedIds.length} عميل</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => {
                const c = customers.find(x => x.id === selectedIds[0]);
                if(c && c.phone) {
                   window.open(\`https://wa.me/\${c.phone.startsWith('0') ? '966' + c.phone.substring(1) : c.phone}\`, '_blank');
                }
              }} disabled={selectedIds.length !== 1}>واتساب</Button>
              <Button size="sm" onClick={handleBulkArchive} className="bg-rose-600 hover:bg-rose-700 text-white">أرشفة</Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>إلغاء التحديد</Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-surface-50 text-surface-600 border-b border-surface-200">
              <tr>
                <th className="p-3 w-10 text-center"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-surface-300" /></th>
                <th className="p-3">العميل</th>
                <th className="p-3">رقم الجوال</th>
                <th className="p-3">المركبة</th>
                <th className="p-3">الزيارات</th>
                <th className="p-3">آخر زيارة</th>
                <th className="p-3">إجمالي الصرف</th>
                <th className="p-3">الاشتراك</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.length === 0 ? (
                 <tr><td colSpan={10} className="p-8"><EmptyState message={tr('noData', lang)} /></td></tr>
              ) : (
                filtered.map(c => {
                  const sub = getCustomerSub(c.id);
                  const lastVisit = getCustomerLastVisit(c.id);
                  
                  // Calculate total spent safely from our sales data
                  // In a real app we would have an aggregated field
                  return (
                    <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                      <td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-surface-300" /></td>
                      <td className="p-3 font-bold text-primary-700 cursor-pointer" onClick={() => setShowProfile(c.id)}>{c.name}</td>
                      <td className="p-3 text-surface-600" dir="ltr">{c.phone || '-'}</td>
                      <td className="p-3 text-surface-600">{c.plate_number || '-'}</td>
                      <td className="p-3 text-surface-600 font-bold">{c.total_visits || c.loyalty_stamps || 0}</td>
                      <td className="p-3 text-surface-600">{lastVisit ? formatDate(lastVisit, lang) : '-'}</td>
                      <td className="p-3 text-surface-900 font-bold">-</td>
                      <td className="p-3">
                        {sub ? <Badge tone="cyan">{sub.washes_remaining} غسلة</Badge> : <span className="text-surface-400 text-xs">بدون</span>}
                      </td>
                      <td className="p-3">
                        <Badge tone={c.customer_status === 'inactive' ? 'gray' : c.customer_status === 'vip' ? 'purple' : 'green'}>
                           {c.customer_status === 'inactive' ? 'غير نشط' : c.customer_status === 'vip' ? 'VIP' : 'نشط'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button size="sm" variant="outline" onClick={() => setShowEdit(c.id)} className="h-8">تعديل</Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('src/pages/CustomersPage.tsx', code);
