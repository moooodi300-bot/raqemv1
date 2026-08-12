const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

const target = `<label key={p.key} className={\`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg transition-colors \${isSelected ? 'bg-primary-50 text-primary-800' : 'hover:bg-surface-200 text-surface-700'}\`}>
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center \${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-surface-300'}\`}>`;

const rep = `<label key={p.key} className={\`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg transition-colors \${isSelected ? 'bg-primary-50 text-primary-800' : 'hover:bg-surface-200 text-surface-700'}\`}>
                    <input type="checkbox" className="hidden" checked={!!isSelected} onChange={() => togglePermission(p.key)} />
                    <div className={\`w-4 h-4 rounded border flex items-center justify-center \${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-surface-300'}\`}>`;

code = code.replace(target, rep);
fs.writeFileSync('src/components/StaffSettings.tsx', code);
