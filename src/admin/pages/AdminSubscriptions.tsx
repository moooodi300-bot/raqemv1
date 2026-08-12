import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, Calendar } from 'lucide-react';

export function AdminSubscriptions() {
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    setOrgs(JSON.parse(localStorage.getItem('saas_orgs') || '[]'));
  }, []);

  return (
    <div className="space-y-6" dir="ltr">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Platform Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Business</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Registered</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
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
                      {org.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(org.created_at || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Manage</button>
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
