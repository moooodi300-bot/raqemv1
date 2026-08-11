const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const target = `  const handleNav = (key: ModuleKey) => {
    startTransition(() => {
      onNavigate(key);
    });
    setSidebarOpen(false);
  };`;
const replacement = `  const handleNav = (key: ModuleKey) => {
    onNavigate(key);
    setSidebarOpen(false);
  };`;
code = code.replace(target, replacement);

fs.writeFileSync('src/components/Layout.tsx', code);
