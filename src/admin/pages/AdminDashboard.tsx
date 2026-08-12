import React, { useState, useEffect } from 'react';
import { Building2, Users, CreditCard, DollarSign, Activity, AlertCircle, ShoppingBag, Clock } from 'lucide-react';
import { Lang, tr } from '../lib/i18n';
import { adminDataService, AdminBusiness, PlatformStats, AdminActivityItem } from '../lib/adminDataService';

export function AdminDashboard({ lang }: { lang: Lang }) {
  const [stats, setStats] = useState<PlatformStats>({
    totalBusinesses: 0,
    activeBusinesses: 0,
    suspendedBusinesses: 0,
    trialBusinesses: 0,
    expiredBusinesses: 0,
    totalCustomers: 0,
    totalUsers: 0,
    totalSalesCount: 0,
    totalRevenue: 0,
    mrr: 0,
    activeSubscriptionsCount: 0,
    expiringIn3Days: 0,
    expiringIn7Days: 0,
    expiringIn30Days: 0,
    expiredSubscriptionsCount: 0,
  });

  const [recentBusinesses, setRecentBusinesses] = useState<AdminBusiness[]>([]);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pStats, bizList] = await Promise.all([
        adminDataService.getPlatformStatistics(),
        adminDataService.getBusinesses(),
      ]);
      setStats(pStats);
      setRecentBusinesses(bizList.slice(0, 5));
      setActivities(adminDataService.getPlatformActivity().slice(0, 8));
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
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

  const statCards = [
    { label: tr('totalBusinesses', lang), value: stats.totalBusinesses, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: tr('activeSubscriptions', lang), value: stats.activeBusinesses, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: tr('mrr', lang), value: `${stats.mrr.toLocaleString('en-US')} SAR`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: tr('activeUsers', lang), value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: tr('platformCustomers', lang), value: stats.totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: tr('platformSales', lang), value: `${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-100' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">جاري تحميل بيانات المنصة الحقيقية...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <s.icon className={`w-7 h-7 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1" dir="ltr">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">{tr('recentRegistrations', lang)}</h3>
            <span className="text-xs text-slate-400 font-medium">البيانات الحية</span>
          </div>
          <div className="space-y-4">
            {recentBusinesses.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-800">{org.name}</p>
                  <p className="text-xs text-slate-500">ID: <span dir="ltr">{org.id}</span> | {org.owner_name || 'المالك'}</p>
                </div>
                <div className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  org.subscription_status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : org.subscription_status === 'suspended'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {tr(org.subscription_status || 'inactive', lang)}
                </div>
              </div>
            ))}
            {recentBusinesses.length === 0 && (
              <div className="text-center py-8 text-slate-400">لا توجد منشآت مسجلة حالياً</div>
            )}
          </div>
        </div>

        {/* Live Platform Activity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">النشاط المباشر عبر المنشآت</h3>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {activities.map((act) => (
              <div key={act.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{act.title}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded-md">{act.tenant_name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{act.details}</p>
                </div>
                <div className="text-end shrink-0">
                  {act.amount !== undefined && (
                    <div className="text-xs font-bold text-emerald-600" dir="ltr">{act.amount.toFixed(2)} SAR</div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5" dir="ltr">
                    {new Date(act.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                <p>لا يوجد نشاط مسجل حديثاً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

