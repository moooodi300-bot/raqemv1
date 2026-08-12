import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Car, Wallet, Users, Target, Coins,
  Calendar, ChevronDown, Sparkles, Activity
} from 'lucide-react';
import { formatSAR, formatNumber } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import type { Expense, Purchase, Staff, Sale, Customer } from '@/lib/types';
import { Card, CardBody, CardHeader, PageHeader, Spinner, StatCard } from '@/components/ui';
import { getTenantCustomerSubscriptions, getSubscriptionUsageLogs } from '@/lib/subscriptionStore';

type RangeKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'last3m' | 'thisYear' | 'custom';

export function DashboardPage() {
  const { settings, organization } = useAuth();
  const currentTenantId = organization?.id || 'org_client_01';
  
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSubs, setCustomerSubs] = useState<any[]>([]);
  const [subUsageLogs, setSubUsageLogs] = useState<any[]>([]);
  
  const [range, setRange] = useState<RangeKey>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const storedStaff = localStorage.getItem(`tenant_staff_${currentTenantId}`);
        if(storedStaff) setStaff(JSON.parse(storedStaff));
        const storedSales = localStorage.getItem(`tenant_sales_${currentTenantId}`);
        const parsedSales = storedSales ? JSON.parse(storedSales) : [];
        setSales(parsedSales.map((s: any) => ({
          ...s,
          wash_count: s.items ? s.items.length : 1
        })));
        
        const storedPurchases = localStorage.getItem(`tenant_purchases_${currentTenantId}`);
        const parsedPurchases = storedPurchases ? JSON.parse(storedPurchases) : [];
        setPurchases(parsedPurchases);

        // We only use actual expenses now, not settings-based fake expenses
        const storedExpenses = localStorage.getItem(`accounts_transactions_${currentTenantId}`);
        if (storedExpenses) {
           const tr = JSON.parse(storedExpenses).filter((t: any) => t.type === 'out');
           setExpenses(tr.map((t: any) => ({
              id: t.id,
              amount: t.amount,
              category: t.category,
              expense_date: t.date,
           })));
        }

        const storedCustomers = localStorage.getItem(`tenant_customers_${currentTenantId}`);
        if (storedCustomers) {
          setCustomers(JSON.parse(storedCustomers));
        }

        setCustomerSubs(getTenantCustomerSubscriptions(currentTenantId));
        setSubUsageLogs(getSubscriptionUsageLogs(currentTenantId));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [currentTenantId]);

  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (range === 'today') {
      return { startDate: startOfToday, endDate: now, rangeLabel: 'اليوم' };
    }
    if (range === 'yesterday') {
      const s = new Date(startOfToday); s.setDate(s.getDate() - 1);
      const e = new Date(startOfToday); e.setMilliseconds(-1);
      return { startDate: s, endDate: e, rangeLabel: 'الأمس' };
    }
    if (range === 'last7') {
      const s = new Date(startOfToday); s.setDate(s.getDate() - 7);
      return { startDate: s, endDate: now, rangeLabel: 'آخر 7 أيام' };
    }
    if (range === 'last30') {
      const s = new Date(startOfToday); s.setDate(s.getDate() - 30);
      return { startDate: s, endDate: now, rangeLabel: 'آخر 30 يوم' };
    }
    if (range === 'last3m') {
      const s = new Date(startOfToday); s.setMonth(s.getMonth() - 3);
      return { startDate: s, endDate: now, rangeLabel: 'آخر 3 أشهر' };
    }
    if (range === 'thisYear') {
      const s = new Date(now.getFullYear(), 0, 1);
      return { startDate: s, endDate: now, rangeLabel: 'هذا العام' };
    }
    return {
      startDate: customFrom ? new Date(customFrom) : new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: customTo ? new Date(customTo) : now,
      rangeLabel: 'تخصيص',
    };
  }, [range, customFrom, customTo]);

  const metrics = useMemo(() => {
    // 1. Filter Sales
    const filteredSales = sales.filter(s => {
      if(s.status === 'cancelled') return false; // exclude cancelled
      const d = new Date(s.created_at);
      return d >= startDate && d <= endDate;
    });

    // 2. Filter Expenses
    const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.expense_date);
      return d >= startDate && d <= endDate;
    });

    // 3. Filter Purchases
    const filteredPurchases = purchases.filter(p => {
      const d = new Date(p.purchase_date);
      return d >= startDate && d <= endDate;
    });

    const totalSales = filteredSales.reduce((sum, s) => {
       // if it's a refund, subtract
       if (s.is_refund) return sum - Number(s.refund_amount || s.total);
       return sum + Number(s.total);
    }, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalPurchases = filteredPurchases.reduce((sum, p) => sum + Number(p.total), 0);
    const netProfit = totalSales - totalExpenses - totalPurchases;
    
    // Number of services/washes
    const totalServices = filteredSales.reduce((sum, s) => {
       if (s.is_refund) return sum; // exclude refunded from count
       return sum + (s.wash_count || 1);
    }, 0);

    return { totalSales, totalExpenses, totalPurchases, netProfit, totalServices };
  }, [sales, expenses, purchases, startDate, endDate]);

    const recentActivities = [...sales]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)
    .map(s => {
       const sName = staff.find(st => st.id === s.staff_id)?.name || 'غير محدد';
       return {
          id: s.id,
          time: new Date(s.created_at),
          text: `${sName} قام بإنشاء ${s.is_free ? 'غسلة مجانية' : (s.is_refund ? 'استرجاع فاتورة' : 'فاتورة مبيعات')} بقيمة ${s.total} ريال`
       };
    });

  const customerStats = useMemo(() => {
    const activeCustomers = customers.filter(c => c.customer_status === 'active' || !c.customer_status).length;
    
    const now = new Date();
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

    const noVisit20 = customers.filter(c => {
       const lastVisit = new Date(c.updated_at || c.created_at);
       return lastVisit < twentyDaysAgo;
    }).length;

    const newCustomers = customers.filter(c => {
       const d = new Date(c.created_at);
       return d >= startDate && d <= endDate;
    }).length;

    return { activeCustomers, noVisit20, newCustomers, returningCustomers: activeCustomers - newCustomers };
  }, [customers, startDate, endDate]);

  const subStats = useMemo(() => {
    // Subscriptions created in this period
    const newSubs = customerSubs.filter(cs => {
       const d = new Date(cs.created_at || cs.start_date);
       return d >= startDate && d <= endDate;
    });
    
    // Revenue from new subs
    const newSubsRevenue = newSubs.reduce((sum, cs) => sum + Number(cs.manual_price || 0), 0);

    // Active subs overall (not just in period)
    const activeSubs = customerSubs.filter(cs => {
       return cs.status === 'active' && new Date(cs.end_date) >= new Date();
    }).length;

    // Washes consumed in this period from subscriptions
    const washesConsumed = subUsageLogs.filter(log => {
       const d = new Date(log.used_at);
       return d >= startDate && d <= endDate;
    }).length;

    return { 
       newSubsCount: newSubs.length, 
       newSubsRevenue, 
       activeSubs, 
       washesConsumed 
    };
  }, [customerSubs, subUsageLogs, startDate, endDate]);

  const { targetPeriod, targetAmount, targetProgress } = useMemo(() => {
    let amount = settings?.sales_target_monthly || 50000;
    let periodLabel = 'شهري';
    const expectedSales = metrics.totalSales;

    // Based on range we can adapt, or we can just use Monthly as default
    // Let's implement dynamic target comparison based on range selected
    if (range === 'today' || range === 'yesterday') {
       amount = settings?.sales_target_daily || (amount / 30);
       periodLabel = 'يومي';
    } else if (range === 'last7') {
       amount = (settings?.sales_target_monthly || 50000) / 4;
       periodLabel = 'أسبوعي';
    } else if (range === 'thisYear') {
       amount = (settings?.sales_target_monthly || 50000) * 12;
       periodLabel = 'سنوي';
    }

    const progress = Math.min(Math.round((expectedSales / amount) * 100), 100) || 0;
    
    return { targetPeriod: periodLabel, targetAmount: amount, targetProgress: progress };
  }, [metrics.totalSales, settings, range]);

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="الملخص المالي والتشغيلي" subtitle="أداء المنشأة الفعلي" />

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowRangeMenu((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 transition-colors text-sm font-bold text-surface-700 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-surface-400" />
            النطاق الزمني: {rangeLabel}
            <ChevronDown className="w-4 h-4 text-surface-400" />
          </button>
          {showRangeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRangeMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-surface-200 z-50 overflow-hidden">
                {[
                  { key: 'today', label: 'اليوم' },
                  { key: 'yesterday', label: 'الأمس' },
                  { key: 'last7', label: 'آخر 7 أيام' },
                  { key: 'last30', label: 'آخر 30 يوم' },
                  { key: 'last3m', label: 'آخر 3 أشهر' },
                  { key: 'thisYear', label: 'هذا العام' },
                  { key: 'custom', label: 'تخصيص' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setRange(opt.key as RangeKey); setShowRangeMenu(false); }}
                    className={`w-full text-right px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors ${range === opt.key ? 'font-bold text-primary-700 bg-primary-50' : 'text-surface-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {range === 'custom' && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-surface-200 shadow-sm">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="bg-transparent border-0 text-sm font-medium outline-none text-surface-700" />
            <span className="text-surface-400 text-sm font-bold">إلى</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="bg-transparent border-0 text-sm font-medium outline-none text-surface-700" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="المبيعات (فعلية)"
          value={formatSAR(metrics.totalSales, 'ar')}
          icon={<Wallet className="w-5 h-5 text-emerald-600" />}
          trend={1} // Just visual
        />
        <StatCard
          title="المصروفات"
          value={formatSAR(metrics.totalExpenses, 'ar')}
          icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="المشتريات"
          value={formatSAR(metrics.totalPurchases, 'ar')}
          icon={<Coins className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="الصافي"
          value={formatSAR(metrics.netProfit, 'ar')}
          icon={<Activity className="w-5 h-5 text-primary-600" />}
          trend={metrics.netProfit >= 0 ? 1 : -1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
         <Card>
           <CardHeader title="تحليل الاشتراكات" icon={<Sparkles className="w-5 h-5 text-amber-500" />} />
           <CardBody className="p-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                    <div className="text-2xl font-black text-amber-900 mb-1">{formatNumber(subStats.activeSubs, 'ar')}</div>
                    <div className="text-xs text-amber-700 font-bold">إجمالي الاشتراكات النشطة</div>
                 </div>
                 <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                    <div className="text-2xl font-black text-amber-900 mb-1">{formatNumber(subStats.newSubsCount, 'ar')}</div>
                    <div className="text-xs text-amber-700 font-bold">اشتراكات جديدة (بالفترة)</div>
                 </div>
                 <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                    <div className="text-2xl font-black text-emerald-700 mb-1">{formatSAR(subStats.newSubsRevenue, 'ar')}</div>
                    <div className="text-xs text-amber-700 font-bold">إيرادات الاشتراكات (بالفترة)</div>
                 </div>
                 <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                    <div className="text-2xl font-black text-primary-700 mb-1">{formatNumber(subStats.washesConsumed, 'ar')}</div>
                    <div className="text-xs text-amber-700 font-bold">غسلات مستهلكة (بالفترة)</div>
                 </div>
              </div>
           </CardBody>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
           <CardHeader title="العملاء والخدمات" icon={<Users className="w-5 h-5 text-surface-400" />} />
           <CardBody className="p-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-surface-50 rounded-xl border border-surface-100 text-center">
                    <div className="text-2xl font-black text-surface-900 mb-1">{formatNumber(metrics.totalServices, 'ar')}</div>
                    <div className="text-xs text-surface-500 font-bold">الخدمات المنجزة</div>
                 </div>
                 <div className="p-4 bg-surface-50 rounded-xl border border-surface-100 text-center">
                    <div className="text-2xl font-black text-surface-900 mb-1">{formatNumber(customerStats.activeCustomers, 'ar')}</div>
                    <div className="text-xs text-surface-500 font-bold">العملاء النشطين</div>
                 </div>
                 <div className="p-4 bg-surface-50 rounded-xl border border-surface-100 text-center">
                    <div className="text-2xl font-black text-surface-900 mb-1">{formatNumber(customerStats.newCustomers, 'ar')}</div>
                    <div className="text-xs text-surface-500 font-bold">عملاء جدد</div>
                 </div>
                 <div className="p-4 bg-surface-50 rounded-xl border border-surface-100 text-center">
                    <div className="text-2xl font-black text-rose-600 mb-1">{formatNumber(customerStats.noVisit20, 'ar')}</div>
                    <div className="text-xs text-surface-500 font-bold">انقطاع 20+ يوم</div>
                 </div>
              </div>
           </CardBody>
         </Card>

         <Card className="bg-surface-900 text-white border-0 shadow-lg">
           <CardHeader title="الهدف المالي" icon={<Target className="w-5 h-5 text-primary-400" />} className="border-surface-800 text-white" />
           <CardBody className="p-6">
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-surface-400 text-sm mb-1">الهدف ({targetPeriod})</p>
                       <p className="text-3xl font-black">{formatSAR(targetAmount, 'ar')}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-surface-400 text-sm mb-1">المحقق</p>
                       <p className="text-2xl font-bold text-emerald-400">{formatSAR(metrics.totalSales, 'ar')}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-surface-300">التقدم</span>
                       <span className="text-emerald-400">{targetProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-surface-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                         style={{ width: `${targetProgress}%` }}
                       />
                    </div>
                 </div>
              </div>
           </CardBody>
         </Card>
      </div>

      {/* Activity Feed */}
      <div className="pt-6">
        <PageHeader title="سجل النشاطات" subtitle="آخر العمليات التي قام بها الموظفون" />
        <Card>
          <CardBody className="p-0">
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-surface-100 max-h-96 overflow-y-auto">
                {recentActivities.map(act => (
                  <div key={act.id} className="p-4 hover:bg-surface-50 flex items-start gap-4 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-surface-800">{act.text}</p>
                      <p className="text-xs text-surface-500 mt-1">{act.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - {act.time.toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-surface-500">
                لا توجد نشاطات حديثة
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
