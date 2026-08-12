import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, Search, Filter } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { Lang, tr } from '../lib/i18n';

export function AdminExports({ lang }: { lang: Lang }) {
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

  const getTranslatedHeaders = (data: any[], type: string) => {
    if (data.length === 0) return data;
    
    if (lang === 'ar') {
      if (type === 'businesses') {
        return data.map(item => ({
          'المعرف': item.id,
          'اسم المنشأة': item.name,
          'الحالة': tr(item.subscription_status || 'inactive', lang),
          'تاريخ الاشتراك': new Date(item.created_at || Date.now()).toLocaleDateString('en-US')
        }));
      }
      if (type === 'customers') {
        return data.map(item => ({
          'الاسم': item.name,
          'رقم الجوال': item.phone,
          'النوع': item.type,
          'المنشأة (المعرف)': item.tenant_id
        }));
      }
      if (type === 'sales') {
        return data.map(item => ({
          'رقم الفاتورة': item.id,
          'التاريخ': new Date(item.date).toLocaleDateString('en-US'),
          'المبلغ الإجمالي': item.total,
          'المنشأة (المعرف)': item.tenant_id
        }));
      }
    } else {
      if (type === 'businesses') {
        return data.map(item => ({
          'ID': item.id,
          'Business Name': item.name,
          'Status': tr(item.subscription_status || 'inactive', lang),
          'Start Date': new Date(item.created_at || Date.now()).toLocaleDateString('en-US')
        }));
      }
      if (type === 'customers') {
        return data.map(item => ({
          'Name': item.name,
          'Phone': item.phone,
          'Type': item.type,
          'Tenant ID': item.tenant_id
        }));
      }
      if (type === 'sales') {
        return data.map(item => ({
          'Invoice ID': item.id,
          'Date': new Date(item.date).toLocaleDateString('en-US'),
          'Total Amount': item.total,
          'Tenant ID': item.tenant_id
        }));
      }
    }
    
    return data;
  };

  const handleExportCSV = () => {
    if (dataToExport.length === 0) return alert(tr('noRecordsToExport', lang));
    const translatedData = getTranslatedHeaders(dataToExport, exportType);
    const ws = utils.json_to_sheet(translatedData);
    
    // Add BOM for UTF-8 to work in Excel correctly with Arabic characters
    const csvContent = '\uFEFF' + utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SaaS_Export_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    if (dataToExport.length === 0) return alert(tr('noRecordsToExport', lang));
    const translatedData = getTranslatedHeaders(dataToExport, exportType);
    const ws = utils.json_to_sheet(translatedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Export');
    writeFile(wb, `SaaS_Export_${exportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          {tr('exportConfiguration', lang)}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{tr('business', lang)}</label>
            <select 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-start"
              value={selectedBusiness}
              onChange={e => setSelectedBusiness(e.target.value)}
            >
              <option value="all">{tr('allBusinesses', lang)}</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{tr('dataType', lang)}</label>
            <select 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-start"
              value={exportType}
              onChange={e => setExportType(e.target.value)}
            >
              <option value="businesses">{tr('businesses', lang)}</option>
              <option value="customers">{tr('customers', lang)}</option>
              <option value="sales">{tr('sales', lang)}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{tr('dateRange', lang)}</label>
            <select 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-start"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="all">{tr('allTime', lang)}</option>
              <option value="today">{tr('today', lang)}</option>
              <option value="7days">{tr('last7Days', lang)}</option>
              <option value="30days">{tr('last30Days', lang)}</option>
              <option value="year">{tr('thisYear', lang)}</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4">{tr('exportPreview', lang)}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-start">
            <div>
              <p className="text-xs text-slate-500">{tr('recordsFound', lang)}</p>
              <p className="text-xl font-bold text-blue-600" dir="ltr">{previewRecords}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{tr('business', lang)}</p>
              <p className="text-sm font-medium text-slate-800">{selectedBusiness === 'all' ? tr('all', lang) : businesses.find(b => b.id === selectedBusiness)?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{tr('dataType', lang)}</p>
              <p className="text-sm font-medium text-slate-800 capitalize">{tr(exportType, lang)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{tr('dateRange', lang)}</p>
              <p className="text-sm font-medium text-slate-800 capitalize">{tr(dateRange, lang) || dateRange}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleExportExcel}
              disabled={previewRecords === 0}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              {tr('exportExcel', lang)}
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={previewRecords === 0}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              <FileText className="w-5 h-5" />
              {tr('exportCSV', lang)}
            </button>
            <button 
              disabled={previewRecords === 0}
              onClick={() => alert(tr('pdfExportMsg', lang))}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
            >
              <FileDown className="w-5 h-5" />
              {tr('exportPDF', lang)}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
        <p className="font-bold flex items-center gap-2 mb-1">
          <Search className="w-4 h-4" /> {tr('anonymizedAnalytics', lang)}
        </p>
        <p>{tr('anonymizedDesc', lang)}</p>
      </div>
    </div>
  );
}
