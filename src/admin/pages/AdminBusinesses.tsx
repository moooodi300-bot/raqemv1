import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit, ShieldBan, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { Lang, tr } from '../lib/i18n';

export function AdminBusinesses({ onSelectTenant, lang }: { onSelectTenant: (id: string) => void; lang: Lang }) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
    setBusinesses(orgs);
  }, []);

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
        <div className="relative flex-1 max-w-md">
          <Search className={`w-5 h-5 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input 
            type="text" 
            placeholder={tr('searchBusinesses', lang)} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          />
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {tr('filter', lang)}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start">
          <thead className="bg-slate-50 border-b border-slate-200 text-start">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">{tr('businessId', lang)}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">{tr('plan', lang)}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">{tr('status', lang)}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-start">{tr('dateRegistered', lang)}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-end">{tr('actions', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(org => (
              <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{org.name}</div>
                  <div className="text-xs text-slate-400" dir="ltr">{org.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Pro Plan
                  </span>
                </td>
                <td className="px-6 py-4">
                  {org.subscription_status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {tr('active', lang)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      {tr(org.subscription_status || 'inactive', lang)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600" dir="ltr">
                  {new Date(org.created_at || Date.now()).toLocaleDateString('en-US')}
                </td>
                <td className="px-6 py-4 text-end">
                  <button 
                    onClick={() => onSelectTenant(org.id)}
                    className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={tr('viewDetails', lang)}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
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
      </div>
    </div>
  );
}
