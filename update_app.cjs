const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = `import { AdminApp } from '@/admin/AdminApp';\n\nfunction AppContent()`;
code = code.replace(/function AppContent\(\)/, importStatement);

const gateCode = `function App() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) {
    return <AdminApp />;
  }

  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}`;

code = code.replace(/function App\(\) {[\s\S]*?}/, gateCode);
fs.writeFileSync('src/App.tsx', code);
