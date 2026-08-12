import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, Search, Filter } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { Lang, tr } from '../lib/i18n';
import { adminDataService, AdminBusiness } from '../lib/adminDataService';

export function AdminExports({ lang }: { lang: Lang }) {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [exportType, setExportType] = useState<string>('customers');
  const [dateRange, setDateRange] = useState<string>('all');
  const [previewRecords, setPreviewRecords] = useState<number>(0);
  const [dataToExport, setDataToExport] = useState<any[]>([]);

  useEffect(() => {
    adminDataService.getBusinesses().then((orgs) => setBusinesses(orgs));
  }, []);

  useEffect(() => {
    let records: any[] = [];

    if (exportType === 'businesses') {
      records = selectedBusiness === 'all' ? businesses : businesses.filter((b) => b.id === selectedBusiness);
    } else if (exportType === 'customers') {
      records = adminDataService.getCustomers(selectedBusiness === 'all' ? undefined : selectedBusiness);
    } else if (exportType === 'sales') {
      records = adminDataService.getSales(selectedBusiness === 'all' ? undefined : selectedBusiness);
    } else if (exportType === 'jobCards') {
      records = adminDataService.getJobCards(selectedBusiness === 'all' ? undefined : selectedBusiness);
    } else if (exportType === 'purchases') {
      records = adminDataService.getPurchases(selectedBusiness === 'all' ? undefined : selectedBusiness);
    }

    setDataToExport(records);
    setPreviewRecords(records.length);
  }, [selectedBusiness, exportType, businesses]);

  const getTranslatedHeaders = (data: any[], type: string) => {
    if (data.length === 0) return data;

    if (lang === 'ar') {
      if (type === 'businesses') {
        return data.map((item) => ({
          'المعرف': item.id,
          'اسم المنشأة': item.name,
          'المالك': item.owner_name || 'غير معروف',
          'الجوال': item.owner_phone || '-',
          'الباقة': item.plan_name || 'Pro Plan',
          'الحالة': tr(item.subscription_status || 'inactive', lang),
          'تاريخ التسجيل': new Date(item.created_at || Date.now()).toLocaleDateString('en-US'),
        }));
      }
      if (type === 'customers') {
        return data.map((item) => ({
          'الاسم': item.name,
          'رقم الجوال': item.phone || '-',
          'اللوحة': item.plate_number || '-',
          'نوع السيارة': item.vehicle_type || '-',
          'عدد الزيارات': item.total_visits || 0,
          'المنشأة (المعرف)': item.tenant_name || item.tenant_id,
        }));
      }
      if (type === 'sales') {
        return data.map((item) => ({
          'رقم الفاتورة': item.id,
          'العميل': item.customer?.name || 'زائر',
          'طريقة الدفع': item.payment_method || 'نقدي',
          'المبلغ الإجمالي': item.total,
          'التاريخ': new Date(item.created_at || item.date || Date.now()).toLocaleDateString('en-US'),
          'المنشأة': item.tenant_name || item.tenant_id,
        }));
      }
    } else {
      if (type === 'businesses') {
        return data.map((item) => ({
          'ID': item.id,
          'Business Name': item.name,
          'Owner': item.owner_name || 'Unknown',
          'Phone': item.owner_phone || '-',
          'Plan': item.plan_name || 'Pro Plan',
          'Status': tr(item.subscription_status || 'inactive', lang),
          'Start Date': new Date(item.created_at || Date.now()).toLocaleDateString('en-US'),
        }));
      }
      if (type === 'customers') {
        return data.map((item) => ({
          'Name': item.name,
          'Phone': item.phone || '-',
          'Plate': item.plate_number || '-',
          'Vehicle': item.vehicle_type || '-',
          'Visits': item.total_visits || 0,
          'Tenant': item.tenant_name || item.tenant_id,
        }));
      }
      if (type === 'sales') {
        return data.map((item) => ({
          'Invoice ID': item.id,
          'Customer': item.customer?.name || 'Visitor',
          'Payment Method': item.payment_method || 'Cash',
          'Total Amount': item.total,
          'Date': new Date(item.created_at || item.date || Date.now()).toLocaleDateString('en-US'),
          'Tenant': item.tenant_name || item.tenant_id,
        }));
      }
    }

    return data;
  };

  const handleExportCSV = () => {
    if (dataToExport.length === 0) return alert(tr('noRecordsToExport', lang));
    
    // Log the export action
    const activity = JSON.parse(localStorage.getItem('saas_admin_activity') || '[]');
    activity.push({
      action: 'Export Data (CSV)',
      target: exportType,
      details: `Business: ${selectedBusiness}, DateRange: ${dateRange}`,
      date: new Date().toISOString()
    });
    localStorage.setItem('saas_admin_activity', JSON.stringify(activity));

    const translatedData = getTranslatedHeaders(dataToExport, exportType);
    const ws = utils.json_to_sheet(translatedData);
    const csvContent = '\uFEFF' + utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SaaS_Export_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    if (dataToExport.length === 0) return alert(tr('noRecordsToExport', lang));
    
    // Log the export action
    const activity = JSON.parse(localStorage.getItem('saas_admin_activity') || '[]');
    activity.push({
      action: 'Export Data (Excel)',
      target: exportType,
      details: `Business: ${selectedBusiness}, DateRange: ${dateRange}`,
      date: new Date().toISOString()
    });
    localStorage.setItem('saas_admin_activity', JSON.stringify(activity));

    const translatedData = getTranslatedHeaders(dataToExport, exportType);
    const ws = utils.json_to_sheet(translatedData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Export');
    writeFile(wb, `SaaS_Export_${exportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 text-start">
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
              onChange={(e) => setSelectedBusiness(e.target.value)}
            >
              <option value="all">{tr('allBusinesses', lang)}</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{tr('dataType', lang)}</label>
            <select
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-start"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="businesses">{tr('businesses', lang)}</option>
              <option value="customers">{tr('customers', lang)}</option>
              <option value="sales">{tr('sales', lang)}</option>
              <option value="jobCards">بطاقات العمل</option>
              <option value="purchases">المشتريات</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{tr('dateRange', lang)}</label>
            <select
              className="w-full border border-slate-300 rounded-xl px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-start"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
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
              <p className="text-xl font-bold text-blue-600" dir="ltr">
                {previewRecords}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{tr('business', lang)}</p>
              <p className="text-sm font-medium text-slate-800">
                {selectedBusiness === 'all' ? tr('all', lang) : businesses.find((b) => b.id === selectedBusiness)?.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{tr('dataType', lang)}</p>
              <p className="text-sm font-medium text-slate-800 capitalize">{tr(exportType, lang) || exportType}</p>
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
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-5 h-5" />
              {tr('exportExcel', lang)}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={previewRecords === 0}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              <FileText className="w-5 h-5" />
              {tr('exportCSV', lang)}
            </button>
            <button
              disabled={previewRecords === 0}
              onClick={() => handleExportCSV()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              <FileDown className="w-5 h-5" />
              تصدير تقرير شامل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

