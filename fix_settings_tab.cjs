const fs = require('fs');
let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');

code = code.replace(
  /useState<'facility' \| 'services' \| 'packages' \| 'costs' \| 'roles' \| 'fleet' \| 'loyalty' \| 'whatsapp' \| 'backup' \| 'discounts'>/,
  "useState<'facility' | 'services' | 'packages' | 'costs' | 'roles' | 'staff' | 'fleet' | 'loyalty' | 'whatsapp' | 'backup' | 'discounts'>"
);

const btnTarget = `<button onClick={() => setActiveTab('roles')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'roles' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <ShieldCheck className="w-5 h-5" /> الصلاحيات والأدوار
          </button>`;

const btnRep = `<button onClick={() => setActiveTab('staff')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'staff' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <Users className="w-5 h-5" /> المستخدمين والصلاحيات
          </button>
          <button onClick={() => setActiveTab('roles')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'roles' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <ShieldCheck className="w-5 h-5" /> الأدوار الافتراضية
          </button>`;

code = code.replace(btnTarget, btnRep);

fs.writeFileSync('src/pages/SettingsPage.tsx', code);
