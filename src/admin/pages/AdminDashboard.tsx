import React, { useState, useEffect } from 'react';
import { Building2, Users, CreditCard, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { Lang, tr } from '../lib/i18n';

export function AdminDashboard({ lang }: { lang: Lang }) {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    totalUsers: 0,
    totalCustomers: 0,
    totalSales: 0,
    mrr: 0
  });

  useEffect(() => {
    try {
      const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
      const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
      
      let totalCustomers = 0;
      let totalSalesAmount = 0;

      orgs.forEach((org: any) => {
        const customers = JSON.parse(localStorage.getItem(`tenant_customers_${org.id}`) || '[]');
        totalCustomers += customers.length;
        
        const sales = JSON.parse(localStorage.getItem(`tenant_sales_${org.id}`) || '[]');
        totalSalesAmount += sales.reduce((acc: number, s: any) => acc + (Number(s.total) || 0), 0);
      });

      setStats({
        totalBusinesses: orgs.length,
        activeBusinesses: orgs.filter((o: any) => o.subscription_status === 'active').length,
        totalUsers: users.length,
        totalCustomers,
        totalSales: totalSalesAmount,
        mrr: orgs.length * 150 // Mocking MRR calculation for demo
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const statCards = [
    { label: tr('totalBusinesses', lang), value: stats.totalBusinesses, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: tr('activeSubscriptions', lang), value: stats.activeBusinesses, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: tr('mrr', lang), value: `${stats.mrr.toLocaleString('en-US')} SAR`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: tr('activeUsers', lang), value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: tr('platformCustomers', lang), value: stats.totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: tr('platformSales', lang), value: `${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`, icon: CreditCard, color: 'text-pink-600', bg: 'bg-pink-100' },
  ];

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
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">{tr('recentRegistrations', lang)}</h3>
          </div>
          <div className="space-y-4">
            {JSON.parse(localStorage.getItem('saas_orgs') || '[]').slice(-5).map((org: any) => (
              <div key={org.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-800">{org.name}</p>
                  <p className="text-xs text-slate-500">ID: <span dir="ltr">{org.id}</span></p>
                </div>
                <div className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  org.subscription_status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {tr(org.subscription_status || 'inactive', lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">{tr('expiringSoon', lang)}</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
            <p>{tr('noExpiring', lang)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
