import React, { useState, useEffect } from 'react';
import { Lang, tr } from '../lib/i18n';

export function AdminSubscriptions({ lang }: { lang: Lang }) {
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    setOrgs(JSON.parse(localStorage.getItem('saas_orgs') || '[]'));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{tr('platformSubscriptions', lang)}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">{tr('business', lang)}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">{tr('plan', lang)}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">{tr('status', lang)}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-start">{tr('dateRegistered', lang)}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-end">{tr('actions', lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgs.map(org => (
                <tr key={org.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{org.name}</td>
                  <td className="px-6 py-4 text-slate-600">Pro Plan</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      org.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tr(org.subscription_status || 'inactive', lang)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600" dir="ltr">
                    {new Date(org.created_at || Date.now()).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">{tr('manage', lang)}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
