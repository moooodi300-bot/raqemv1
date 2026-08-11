const fs = require('fs');

let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');

// 1. Add "policy" to tabs
const tabsTarget = `<button onClick={() => setActiveTab('discounts')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'discounts' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <Tag className="w-5 h-5" /> أكواد الخصم
          </button>`;
const tabsReplacement = `<button onClick={() => setActiveTab('discounts')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'discounts' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <Tag className="w-5 h-5" /> أكواد الخصم
          </button>
          <button onClick={() => setActiveTab('policy')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'policy' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <FileText className="w-5 h-5" /> سياسة الخدمة
          </button>`;
code = code.replace(tabsTarget, tabsReplacement);

// 2. Add Policy tab content
const defaultPolicy = "تعتبر العربون غير مسترد.\\nالمحل غير مسؤول عن الأضرار السابقة، العيوب، العيوب الخفية، أو المشاكل التي لم يتم الإفصاح عنها أو توثيقها قبل الخدمة.\\nالعميل مسؤول عن إزالة الممتلكات الشخصية والأشياء الثمينة من المركبة قبل تسليمها.\\nيوافق العميل على فحص المركبة والعمل المنجز عند التسليم.\\nبالنسبة للتظليل، التلميع، الحماية، العناية بالسيارات وغيرها من خدمات العناية بالمركبة، قد تختلف النتائج حسب حالة المركبة، عمرها، الإصلاحات السابقة، حالة الطلاء، المواد، والأضرار الموجودة.\\nأي ضمان للخدمة يطبق فقط وفقاً للشروط المحددة المتفق عليها للخدمة.\\nبموافقة العميل على كرت العمل، يؤكد أنه قرأ وقبل هذه الشروط.";

const contentTarget = `{activeTab === 'backup' && (`;
const contentReplacement = `{activeTab === 'policy' && (
        <Card>
          <CardBody className="p-6 space-y-6">
             <h3 className="text-xl font-black text-surface-800">سياسة الخدمة (شروط كرت العمل)</h3>
             <p className="text-surface-500 text-sm">يتم طباعة هذه السياسة وإرفاقها تلقائياً مع كل كرت عمل جديد وتتطلب موافقة العميل.</p>
             <div>
                <Label>نص السياسة والشروط</Label>
                <textarea 
                  className="w-full border-surface-300 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500 min-h-[200px]"
                  value={(facility as any).service_policy ?? \`${defaultPolicy}\`}
                  onChange={e => setFacility({...facility, service_policy: e.target.value})}
                />
             </div>
             <div className="flex gap-2 pt-4">
                <Button onClick={saveFacility} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Save className="w-4 h-4 ml-2"/> حفظ السياسة</Button>
                <Button onClick={() => setFacility({...facility, service_policy: \`${defaultPolicy}\`})} variant="secondary">استعادة النص الافتراضي</Button>
             </div>
             <div className="mt-4 p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs leading-relaxed font-medium">
               ملاحظة قانونية هامة: النظام يوفر ميزة طباعة سياسة الخدمة لتنظيم العمل الداخلي وإشعار العميل. يجب على صاحب المنشأة مراجعة الصياغة والتأكد من توافقها مع قوانين ولوائح حماية المستهلك والأنظمة المعمول بها في المملكة العربية السعودية. النظام لا يعتبر هذه الصياغة عقداً قانونياً ملزماً بمفرده.
             </div>
          </CardBody>
        </Card>
      )}
      
      {activeTab === 'backup' && (`;
code = code.replace(contentTarget, contentReplacement);

fs.writeFileSync('src/pages/SettingsPage.tsx', code);
