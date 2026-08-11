const fs = require('fs');

let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// 1. Add getTenantCustomerSubscriptions, getSubscriptionUsageLogs to imports
const importTarget = "import { Card, CardBody, CardHeader, PageHeader, Spinner, StatCard } from '@/components/ui';";
const importReplacement = "import { Card, CardBody, CardHeader, PageHeader, Spinner, StatCard } from '@/components/ui';\nimport { getTenantCustomerSubscriptions, getSubscriptionUsageLogs } from '@/lib/subscriptionStore';";
code = code.replace(importTarget, importReplacement);

// 2. Add state for sub analytics
const stateTarget = "const [customers, setCustomers] = useState<Customer[]>([]);";
const stateReplacement = "const [customers, setCustomers] = useState<Customer[]>([]);\n  const [customerSubs, setCustomerSubs] = useState<any[]>([]);\n  const [subUsageLogs, setSubUsageLogs] = useState<any[]>([]);";
code = code.replace(stateTarget, stateReplacement);

// 3. Update useEffect to fetch these
const fetchTarget = `const storedCustomers = localStorage.getItem(\`tenant_customers_\${currentTenantId}\`);
        if (storedCustomers) {
          setCustomers(JSON.parse(storedCustomers));
        }`;
const fetchReplacement = `const storedCustomers = localStorage.getItem(\`tenant_customers_\${currentTenantId}\`);
        if (storedCustomers) {
          setCustomers(JSON.parse(storedCustomers));
        }

        setCustomerSubs(getTenantCustomerSubscriptions(currentTenantId));
        setSubUsageLogs(getSubscriptionUsageLogs(currentTenantId));`;
code = code.replace(fetchTarget, fetchReplacement);

// 4. Add useMemo for subscription stats
const useMemoTarget = `const { targetPeriod, targetAmount, targetProgress } = useMemo(() => {`;
const useMemoReplacement = `const subStats = useMemo(() => {
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

  const { targetPeriod, targetAmount, targetProgress } = useMemo(() => {`;
code = code.replace(useMemoTarget, useMemoReplacement);

// 5. Add the UI section for Subscription Analytics
const uiTarget = `<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`;
const uiReplacement = `<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`;
code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/pages/DashboardPage.tsx', code);
