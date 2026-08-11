const fs = require('fs');
let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');

// We will add a tab 'staff' and manage staff list.
const importTarget = "import { RolesSettings } from '@/components/RolesSettings';";
const importReplacement = "import { RolesSettings } from '@/components/RolesSettings';\nimport { StaffSettings } from '@/components/StaffSettings';";

code = code.replace(importTarget, importReplacement);

const tabsTarget = `<button onClick={() => setActiveTab('roles')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'roles' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <Shield className="w-5 h-5" /> الصلاحيات
          </button>`;
const tabsReplacement = `<button onClick={() => setActiveTab('roles')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'roles' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <Shield className="w-5 h-5" /> الصلاحيات
          </button>
          <button onClick={() => setActiveTab('staff')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'staff' ? 'bg-primary-600 text-white shadow-md' : 'text-surface-600 hover:bg-surface-100'}\`}>
            <Users className="w-5 h-5" /> الموظفين (PIN)
          </button>`;

code = code.replace(tabsTarget, tabsReplacement);

const rolesTarget = `{activeTab === 'roles' && <RolesSettings />}`;
const rolesReplacement = `{activeTab === 'roles' && <RolesSettings />}
          {activeTab === 'staff' && <StaffSettings />}`;

code = code.replace(rolesTarget, rolesReplacement);

fs.writeFileSync('src/pages/SettingsPage.tsx', code);
