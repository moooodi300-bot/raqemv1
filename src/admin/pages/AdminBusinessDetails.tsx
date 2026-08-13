import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  CreditCard,
  Package,
  Receipt,
  Wrench,
  CheckCircle,
  PauseCircle,
  Calendar,
  Lock
} from 'lucide-react';
import { Lang, tr } from '../lib/i18n';
import { adminDataService } from '../lib/adminDataService';
import { AdminUserPasswordManagement } from '../components/AdminUserPasswordManagement';

export function AdminBusinessDetails({ tenantId, onBack, lang }: { tenantId: string; onBack: () => void; lang: Lang }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'sales' | 'jobCards' | 'subscriptions' | 'purchases' | 'passwords'>('customers');

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await adminDataService.getBusinessDetails(tenantId);
      setDetails(data);
    } catch (err) {
      console.error('Error loading business details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();

    const handleUpdate = () => loadDetails();
    window.addEventListener('raqam_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('raqam_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [tenantId]);

  const handleUpdateStatus = async (status: 'active' | 'suspended') => {
    if (!details?.business) return;
    const actionName = status === 'active' ? 'تفعيل' : 'إيقاف';
    if (window.confirm(`هل أنت أكتيد من ${actionName} اشتراك منشأة "${details.business.name}"؟`)) {
      await adminDataService.updateBusinessSubscription(tenantId, { subscription_status: status });
      await loadDetails();
    }
  };

  const handleExtendSubscription = async () => {
    if (!details?.business) return;
    const days = window.prompt('أدخل عدد الأيام لتمديد اشتراك المنشأة (مثال: 30):', '30');
    if (days && !isNaN(Number(days))) {
      const currentExpiry = details.business.expiry_date ? new Date(details.business.expiry_date) : new Date();
      currentExpiry.setDate(currentExpiry.getDate() + Number(days));
      const newExpiryStr = currentExpiry.toISOString().split('T')[0];

      await adminDataService.updateBusinessSubscription(tenantId, {
        subscription_status: 'active',
        expiry_date: newExpiryStr,
      });
      alert(`تم تمديد اشتراك المنشأة حتى ${newExpiryStr}`);
      await loadDetails();
    }
  };

  if (loading || !details) {
    return <div className="p-8 text-center text-slate-500 font-medium">جاري فحص وحمل كافة البيانات الحقيقية للمنشأة...</div>;
  }

  const { business, customers, sales, jobCards, purchases, expenses, subscriptions, stats } = details;

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors bg-slate-50 border border-slate-200 text-slate-700">
            {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">{business.name}</h2>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                business.subscription_status === 'active'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}>
                {tr(business.subscription_status || 'inactive', lang)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>TENANT ID: <strong className="font-mono text-slate-700" dir="ltr">{business.id}</strong></span>
              {business.owner_name && <span>• المالك: <strong className="text-slate-700">{business.owner_name}</strong></span>}
              {business.owner_phone && <span dir="ltr">• {business.owner_phone}</span>}
              {business.city && <span>• المدينة: {business.city}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {business.subscription_status === 'active' ? (
            <button
              onClick={() => handleUpdateStatus('suspended')}
              className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
            >
              <PauseCircle className="w-4 h-4" />
              إيقاف المنشأة
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus('active')}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              تفعيل المنشأة
            </button>
          )}
          <button
            onClick={handleExtendSubscription}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            تمديد الاشتراك
          </button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">{tr('customers', lang)}</p>
          <p className="text-2xl font-bold text-slate-800" dir="ltr">{stats.customerCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">{tr('sales', lang)}</p>
          <p className="text-2xl font-bold text-slate-800" dir="ltr">{stats.salesCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">{tr('revenue', lang)}</p>
          <p className="text-2xl font-bold text-emerald-600" dir="ltr">{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">{tr('jobCards', lang)}</p>
          <p className="text-2xl font-bold text-slate-800" dir="ltr">{stats.jobCardCount}</p>
        </div>
      </div>

      {/* Live Data Inspection Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'customers' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            عملاء المنشأة ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sales' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            المبيعات والفواتير ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'subscriptions' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            اشتراكات العملاء ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('jobCards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'jobCards' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            بطاقات العمل ({jobCards.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'purchases' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            المشتريات والمصروفات ({purchases.length + expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('passwords')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'passwords' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-300" />
            إدارة كلمات المرور للحسابات
          </button>
        </div>

        <div className="p-6">
          {/* Passwords Tab */}
          {activeTab === 'passwords' && (
            <AdminUserPasswordManagement lang={lang} selectedTenantId={tenantId} />
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-start">الاسم</th>
                    <th className="px-4 py-3 text-start">رقم الجوال</th>
                    <th className="px-4 py-3 text-start">اللوحة والسيارة</th>
                    <th className="px-4 py-3 text-start">عدد الزيارات</th>
                    <th className="px-4 py-3 text-start">نقاط الولاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{c.name}</td>
                      <td className="px-4 py-3 text-slate-600" dir="ltr">{c.phone || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.plate_number ? (
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-800" dir="ltr">
                            {c.plate_number}
                          </span>
                        ) : '-'} {c.vehicle_type ? `(${c.vehicle_type})` : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.total_visits || 0}</td>
                      <td className="px-4 py-3 text-slate-600">{c.loyalty_stamps || 0} ختم</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">لا يوجد عملاء مضافين لهذه المنشأة حالياً</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-start">رقم الفاتورة</th>
                    <th className="px-4 py-3 text-start">العميل</th>
                    <th className="px-4 py-3 text-start">طريقة الدفع</th>
                    <th className="px-4 py-3 text-start">الإجمالي</th>
                    <th className="px-4 py-3 text-start">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600" dir="ltr">{s.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{s.customer?.name || 'زائر'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-bold capitalize">
                          {s.payment_method || 'نقدي'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600" dir="ltr">{Number(s.total || 0).toFixed(2)} SAR</td>
                      <td className="px-4 py-3 text-slate-500 text-xs" dir="ltr">
                        {new Date(s.created_at || s.date || Date.now()).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">لا توجد عمليات مبيعات مسجلة لهذه المنشأة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-start">العميل</th>
                    <th className="px-4 py-3 text-start">اسم الباقة</th>
                    <th className="px-4 py-3 text-start">السيارة/اللوحة</th>
                    <th className="px-4 py-3 text-start">الغسلات المتبقية</th>
                    <th className="px-4 py-3 text-start">تاريخ الانتهاء</th>
                    <th className="px-4 py-3 text-start">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscriptions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{sub.customer_name || 'عميل'}</td>
                      <td className="px-4 py-3 font-medium text-blue-600">{sub.package_name || 'باقة'}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs" dir="ltr">{sub.plate_number || '-'}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{sub.washes_remaining} من {sub.total_washes}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs" dir="ltr">{sub.end_date || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {sub.status === 'active' ? 'نشط' : 'منتهي'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">لا توجد اشتراكات عملاء مسجلة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Job Cards Tab */}
          {activeTab === 'jobCards' && (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-start">العميل</th>
                    <th className="px-4 py-3 text-start">الخدمة</th>
                    <th className="px-4 py-3 text-start">اللوحة</th>
                    <th className="px-4 py-3 text-start">السعر</th>
                    <th className="px-4 py-3 text-start">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobCards.map((j: any) => (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{j.customerName || 'عميل'}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{j.serviceName || 'خدمة غسيل'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600" dir="ltr">{j.vehiclePlate || '-'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600" dir="ltr">{Number(j.price || 0).toFixed(2)} SAR</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded">
                          {j.status || 'في الانتظار'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {jobCards.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">لا توجد بطاقات عمل حالية</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-start">النوع / المورد</th>
                    <th className="px-4 py-3 text-start">الوصف</th>
                    <th className="px-4 py-3 text-start">المبلغ</th>
                    <th className="px-4 py-3 text-start">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">فاتورة شراء: {p.supplier_name || 'مورد'}</td>
                      <td className="px-4 py-3 text-slate-600">{p.description || '-'}</td>
                      <td className="px-4 py-3 font-bold text-rose-600" dir="ltr">{Number(p.total || 0).toFixed(2)} SAR</td>
                      <td className="px-4 py-3 text-slate-500 text-xs" dir="ltr">{new Date(p.created_at || Date.now()).toLocaleDateString('en-US')}</td>
                    </tr>
                  ))}
                  {expenses.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">مصروف: {e.category || 'تشغيلي'}</td>
                      <td className="px-4 py-3 text-slate-600">{e.description || '-'}</td>
                      <td className="px-4 py-3 font-bold text-rose-600" dir="ltr">{Number(e.amount || 0).toFixed(2)} SAR</td>
                      <td className="px-4 py-3 text-slate-500 text-xs" dir="ltr">{e.date || '-'}</td>
                    </tr>
                  ))}
                  {purchases.length === 0 && expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">لا توجد مشتريات أو مصروفات مسجلة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
