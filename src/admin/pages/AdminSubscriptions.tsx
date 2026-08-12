import React, { useState, useEffect } from 'react';
import { Lang, tr } from '../lib/i18n';
import { adminDataService, AdminBusiness } from '../lib/adminDataService';
import { Calendar, CheckCircle, PauseCircle, Clock } from 'lucide-react';

export function AdminSubscriptions({ lang }: { lang: Lang }) {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await adminDataService.getBusinesses();
      setBusinesses(list);
    } catch (e) {
      console.error('Error fetching businesses for subscriptions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('raqam_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('raqam_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleStatusChange = async (b: AdminBusiness, status: 'active' | 'suspended') => {
    if (window.confirm(`هل أنت متأكد من تغيير حالة اشتراك "${b.name}" إلى ${status === 'active' ? 'نشط' : 'موقوف'}؟`)) {
      await adminDataService.updateBusinessSubscription(b.id, { subscription_status: status });
      await loadData();
    }
  };

  const handleExtendDays = async (b: AdminBusiness) => {
    const input = window.prompt('أدخل عدد الأيام الإضافية لتمديد الاشتراك (مثال: 30):', '30');
    if (input && !isNaN(Number(input))) {
      const days = Number(input);
      const curr = b.expiry_date ? new Date(b.expiry_date) : new Date();
      curr.setDate(curr.getDate() + days);
      const newExpiry = curr.toISOString().split('T')[0];

      await adminDataService.updateBusinessSubscription(b.id, {
        subscription_status: 'active',
        expiry_date: newExpiry,
      });
      alert(`تم تمديد اشتراك ${b.name} بنجاح إلى ${newExpiry}`);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{tr('platformSubscriptions', lang)}</h3>
            <p className="text-xs text-slate-500 mt-0.5">إدارة اشتراكات وصلاحيات كافة المنشآت على المنصة</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">جاري تحميل اشتراكات المنشآت...</div>
          ) : (
            <table className="w-full text-start">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">{tr('business', lang)}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">{tr('plan', lang)}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">{tr('status', lang)}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">تاريخ انتهاء الاشتراك</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-end">{tr('actions', lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businesses.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {org.name}
                      <div className="text-xs text-slate-400 font-mono" dir="ltr">{org.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200">
                        {org.plan_name || 'Pro Plan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        org.subscription_status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${org.subscription_status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {tr(org.subscription_status || 'inactive', lang)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-700" dir="ltr">
                      {org.expiry_date || '2026-12-31'}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleExtendDays(org)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          تمديد
                        </button>
                        {org.subscription_status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(org, 'suspended')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            إيقاف
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(org, 'active')}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            تفعيل
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {businesses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">لا توجد اشتراكات مسجلة</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

