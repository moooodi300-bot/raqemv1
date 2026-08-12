import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Building2, User, Phone, Mail, ShieldAlert, CheckCircle, PauseCircle } from 'lucide-react';
import { Lang, tr } from '../lib/i18n';
import { adminDataService, AdminBusiness } from '../lib/adminDataService';

export function AdminBusinesses({ onSelectTenant, lang }: { onSelectTenant: (id: string) => void; lang: Lang }) {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await adminDataService.getBusinesses();
      setBusinesses(data);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();

    const handleUpdate = () => loadBusinesses();
    window.addEventListener('raqam_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('raqam_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleToggleStatus = async (e: React.MouseEvent, org: AdminBusiness) => {
    e.stopPropagation();
    const newStatus = org.subscription_status === 'active' ? 'suspended' : 'active';
    const confirmMsg = newStatus === 'suspended'
      ? `هل أنت أكتيد من إيقاف اشتراك منشأة "${org.name}"؟`
      : `هل تريد تفعيل اشتراك منشأة "${org.name}"؟`;

    if (window.confirm(confirmMsg)) {
      await adminDataService.updateBusinessSubscription(org.id, { subscription_status: newStatus });
      await loadBusinesses();
    }
  };

  const filtered = businesses.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(term) ||
      b.id.toLowerCase().includes(term) ||
      (b.owner_name && b.owner_name.toLowerCase().includes(term)) ||
      (b.owner_email && b.owner_email.toLowerCase().includes(term)) ||
      (b.owner_phone && b.owner_phone.includes(term));

    const matchesStatus = statusFilter === 'all' || b.subscription_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-5 h-5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، المالك، الجوال، البريد، أو المعرف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-10 pe-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium outline-none focus:border-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط (Active)</option>
            <option value="suspended">موقوف (Suspended)</option>
            <option value="trial">تجريبي (Trial)</option>
            <option value="expired">منتهي (Expired)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-500">جاري تحميل المنشآت الحقيقية...</div>
        ) : (
          <table className="w-full text-start">
            <thead className="bg-slate-50 border-b border-slate-200 text-start">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">المنشأة والمالك</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">الخطة / الباقة</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">{tr('status', lang)}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-end">{tr('actions', lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{org.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600" dir="ltr">TENANT_ID: {org.id}</span>
                      {org.owner_name && <span>• {org.owner_name}</span>}
                      {org.owner_phone && <span dir="ltr">• {org.owner_phone}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {org.plan_name || 'Pro Plan'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {org.subscription_status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {tr('active', lang)}
                      </span>
                    ) : org.subscription_status === 'suspended' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        موقوف
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {tr(org.subscription_status || 'inactive', lang)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600" dir="ltr">
                    {new Date(org.created_at || Date.now()).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => handleToggleStatus(e, org)}
                        className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                          org.subscription_status === 'active'
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                        title={org.subscription_status === 'active' ? 'إيقاف المنشأة' : 'تفعيل المنشأة'}
                      >
                        {org.subscription_status === 'active' ? <PauseCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onSelectTenant(org.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        title={tr('viewDetails', lang)}
                      >
                        <Eye className="w-4 h-4" />
                        عرض وحص البيانات
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {tr('noBusinessesFound', lang)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

