import React from 'react';
import { LifeBuoy } from 'lucide-react';
import { Lang, tr } from '../lib/i18n';

export function AdminSupport({ lang }: { lang: Lang }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <LifeBuoy className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{tr('supportAndMaintenance', lang)}</h3>
      <p className="text-slate-500 max-w-md mx-auto">
        {tr('supportDesc', lang)}
      </p>
      <div className="mt-8 border border-slate-100 rounded-xl max-w-2xl mx-auto overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 text-sm font-bold text-slate-500 text-start">{tr('recentTickets', lang)}</div>
        <div className="p-8 text-slate-400 text-sm">{tr('noTickets', lang)}</div>
      </div>
    </div>
  );
}
