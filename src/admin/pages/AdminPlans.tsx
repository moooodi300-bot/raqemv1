import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Lang, tr } from '../lib/i18n';

export function AdminPlans({ lang }: { lang: Lang }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="text-lg font-bold text-slate-800">{tr('subscriptionPlans', lang)}</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> {tr('createPlan', lang)}
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-200 rounded-2xl p-6 relative">
            <div className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg`}>{tr('active', lang)}</div>
            <h4 className="text-lg font-bold text-slate-800">Basic</h4>
            <div className="mt-4 flex items-baseline gap-1" dir="ltr">
              <span className="text-3xl font-bold text-slate-900">149</span>
              <span className="text-slate-500">SAR / mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>• {tr('upToUsers', lang).replace('{n}', '2')}</li>
              <li>• {tr('upToCustomers', lang).replace('{n}', '500')}</li>
              <li>• {tr('standardAnalytics', lang)}</li>
            </ul>
            <button className="w-full mt-6 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50">{tr('editPlan', lang)}</button>
          </div>
          
          <div className="border-2 border-blue-500 rounded-2xl p-6 relative shadow-md">
            <div className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg`}>{tr('active', lang)}</div>
            <h4 className="text-lg font-bold text-blue-700">Pro</h4>
            <div className="mt-4 flex items-baseline gap-1" dir="ltr">
              <span className="text-3xl font-bold text-slate-900">299</span>
              <span className="text-slate-500">SAR / mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>• {tr('unlimitedUsers', lang)}</li>
              <li>• {tr('unlimitedCustomers', lang)}</li>
              <li>• {tr('advancedAnalytics', lang)}</li>
              <li>• {tr('loyaltyWhatsapp', lang)}</li>
            </ul>
            <button className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">{tr('editPlan', lang)}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
