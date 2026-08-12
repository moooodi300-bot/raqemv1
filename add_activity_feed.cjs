const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// 1. Import Staff
code = code.replace(/import type { Sale, Customer, Expense, Purchase } from '@\/lib\/types';/g, "import type { Sale, Customer, Expense, Purchase, Staff } from '@/lib/types';");

// 2. Add staff state
const stateTarget = `const [sales, setSales] = useState<Sale[]>([]);`;
const stateRep = `const [sales, setSales] = useState<Sale[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);`;
code = code.replace(stateTarget, stateRep);

// 3. Load staff
const loadTarget = `const storedSales = localStorage.getItem(\`tenant_sales_\${currentTenantId}\`);`;
const loadRep = `const storedStaff = localStorage.getItem(\`tenant_staff_\${currentTenantId}\`);
        if(storedStaff) setStaff(JSON.parse(storedStaff));
        const storedSales = localStorage.getItem(\`tenant_sales_\${currentTenantId}\`);`;
code = code.replace(loadTarget, loadRep);

// 4. Compute activities
const actComp = `  const recentActivities = [...sales]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)
    .map(s => {
       const sName = staff.find(st => st.id === s.staff_id)?.name || 'غير محدد';
       return {
          id: s.id,
          time: new Date(s.created_at),
          text: \`\${sName} قام بإنشاء \${s.is_free ? 'غسلة مجانية' : (s.is_refund ? 'استرجاع فاتورة' : 'فاتورة مبيعات')} بقيمة \${s.total} ريال\`
       };
    });`;

code = code.replace(/const customerStats = useMemo\(\(\) => \{/, actComp + '\n\n  const customerStats = useMemo(() => {');

// 5. Render it at the bottom
const renderTarget = `         </Card>
      </div>
    </div>
  );
}`;

const renderRep = `         </Card>
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
}`;

code = code.replace(renderTarget, renderRep);
fs.writeFileSync('src/pages/DashboardPage.tsx', code);
