import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Users, CreditCard, Activity, Package, Building2, ExternalLink } from 'lucide-react';
import { Lang, tr } from '../lib/i18n';

export function AdminBusinessDetails({ tenantId, onBack, lang }: { tenantId: string; onBack: () => void; lang: Lang }) {
  const [tenant, setTenant] = useState<any>(null);
  const [stats, setStats] = useState({
    customers: 0,
    sales: 0,
    salesValue: 0,
    jobCards: 0
  });

  useEffect(() => {
    const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
    const found = orgs.find((o: any) => o.id === tenantId);
    setTenant(found);

    const customers = JSON.parse(localStorage.getItem(`tenant_customers_${tenantId}`) || '[]');
    const sales = JSON.parse(localStorage.getItem(`tenant_sales_${tenantId}`) || '[]');
    const jobCards = JSON.parse(localStorage.getItem(`job_cards_${tenantId}`) || '[]');

    setStats({
      customers: customers.length,
      sales: sales.length,
      salesValue: sales.reduce((acc: number, s: any) => acc + (Number(s.total) || 0), 0),
      jobCards: jobCards.length
    });
  }, [tenantId]);

  if (!tenant) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-xl transition-colors bg-white border border-slate-200">
          {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{tenant.name}</h2>
          <p className="text-sm text-slate-500">Tenant ID: <span dir="ltr">{tenant.id}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{tr('customers', lang)}</p>
          <p className="text-2xl font-bold text-slate-800" dir="ltr">{stats.customers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{tr('sales', lang)}</p>
          <p className="text-2xl font-bold text-slate-800" dir="ltr">{stats.sales}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{tr('revenue', lang)}</p>
          <p className="text-2xl font-bold text-slate-800" dir="ltr">{stats.salesValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{tr('jobCards', lang)}</p>
          <p className="text-2xl font-bold text-slate-800" dir="ltr">{stats.jobCards}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{tr('subscriptionDetails', lang)}</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">{tr('plan', lang)}</span>
              <span className="font-medium text-slate-800">Pro Plan</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">{tr('status', lang)}</span>
              <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{tr(tenant.subscription_status || 'inactive', lang)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">{tr('dateRegistered', lang)}</span>
              <span className="font-medium text-slate-800" dir="ltr">{new Date(tenant.created_at || Date.now()).toLocaleDateString('en-US')}</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors">
              {tr('renewPlan', lang)}
            </button>
            <button className="flex-1 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors">
              {tr('suspend', lang)}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{tr('quickActions', lang)}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-start transition-colors">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-bold text-slate-800">{tr('viewUsers', lang)}</div>
              <div className="text-xs text-slate-500 mt-1">{tr('manageAdmins', lang)}</div>
            </button>
            <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-start transition-colors">
              <Activity className="w-6 h-6 text-emerald-600 mb-2" />
              <div className="font-bold text-slate-800">{tr('activityLog', lang)}</div>
              <div className="text-xs text-slate-500 mt-1">{tr('viewAuditTrail', lang)}</div>
            </button>
            <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-start transition-colors">
              <CreditCard className="w-6 h-6 text-purple-600 mb-2" />
              <div className="font-bold text-slate-800">{tr('invoices', lang)}</div>
              <div className="text-xs text-slate-500 mt-1">{tr('saasBillingHistory', lang)}</div>
            </button>
            <button className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-start transition-colors">
              <ExternalLink className="w-6 h-6 text-amber-600 mb-2" />
              <div className="font-bold text-slate-800">{tr('loginAs', lang)}</div>
              <div className="text-xs text-slate-500 mt-1">{tr('accessWorkspace', lang)}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
