import React from 'react';
import { LifeBuoy } from 'lucide-react';

export function AdminSupport() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center" dir="ltr">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <LifeBuoy className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Support & Maintenance</h3>
      <p className="text-slate-500 max-w-md mx-auto">
        Track support tickets, maintenance requests, and client communications across all platform tenants.
      </p>
      <div className="mt-8 border border-slate-100 rounded-xl max-w-2xl mx-auto overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 text-sm font-bold text-slate-500 text-left">Recent Tickets</div>
        <div className="p-8 text-slate-400 text-sm">No support tickets found.</div>
      </div>
    </div>
  );
}
