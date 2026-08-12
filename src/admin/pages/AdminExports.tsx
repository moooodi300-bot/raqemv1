import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, Search, Filter } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

export function AdminExports() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [exportType, setExportType] = useState<string>('customers');
  const [dateRange, setDateRange] = useState<string>('all');
  const [previewRecords, setPreviewRecords] = useState<number>(0);
  const [dataToExport, setDataToExport] = useState<any[]>([]);

  useEffect(() => {
    const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
    setBusinesses(orgs);
  }, []);

  useEffect(() => {
    // Generate preview
    let records = [];
    const targets = selectedBusiness === 'all' ? businesses.map(b => b.id) : [selectedBusiness];
    
    targets.forEach(tid => {
      if (exportType === 'customers') {
        const c = JSON.parse(localStorage.getItem(`tenant_customers_${tid}`) || '[]');
        records = records.concat(c.map((item:any) => ({ ...item, tenant_id: tid })));
      } else if (exportType === 'sales') {
        const s = JSON.parse(localStorage.getItem(`tenant_sales_${tid}`) || '[]');
        records = records.concat(s.map((item:any) => ({ ...item, tenant_id: tid })));
      } else if (exportType === 'businesses') {
        records = businesses;
      }
    });

    setDataToExport(records);
    setPreviewRecords(records.length);
  }, [selectedBusiness, exportType, businesses]);

  const handleExportCSV = () => {
    if (dataToExport.length === 0) return alert('No records found to export');
    const ws = utils.json_to_sheet(dataToExport);
    const csv = utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SaaS_Export_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    if (dataToExport.length === 0) return alert('No records found to export');
    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Export');
    writeFile(wb, `SaaS_Export_${exportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6" dir="ltr">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Export Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Business</label>
            <select 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedBusiness}
              onChange={e => setSelectedBusiness(e.target.value)}
            >
              <option value="all">All Businesses</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data Type</label>
            <select 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={exportType}
              onChange={e => setExportType(e.target.value)}
            >
              <option value="businesses">Businesses</option>
              <option value="customers">Customers</option>
              <option value="sales">Sales</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="job_cards">Job Cards</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4">Export Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-500">Records Found</p>
              <p className="text-xl font-bold text-blue-600">{previewRecords}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Business</p>
              <p className="text-sm font-medium text-slate-800">{selectedBusiness === 'all' ? 'All' : businesses.find(b => b.id === selectedBusiness)?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Data Type</p>
              <p className="text-sm font-medium text-slate-800 capitalize">{exportType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Date Range</p>
              <p className="text-sm font-medium text-slate-800 capitalize">{dateRange}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleExportExcel}
              disabled={previewRecords === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Export Excel
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={previewRecords === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              <FileText className="w-5 h-5" />
              Export CSV
            </button>
            <button 
              disabled={previewRecords === 0}
              onClick={() => alert('PDF export logic to be implemented on server for large datasets.')}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              <FileDown className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
        <p className="font-bold flex items-center gap-2 mb-1">
          <Search className="w-4 h-4" /> Anonymized Analytics
        </p>
        <p>For large market studies, exporting Anonymized Data will strip personally identifiable information (PII) such as customer names and phone numbers, leaving only metrics and geographic information.</p>
      </div>
    </div>
  );
}
