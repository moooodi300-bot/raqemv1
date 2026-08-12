const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomersPage.tsx', 'utf8');

code = code.replace(
  `<Button size="sm" variant="outline" onClick={() => setShowEdit(c.id)} className="h-8">تعديل</Button>`,
  `{can('customers.edit') && <Button size="sm" variant="outline" onClick={() => setShowEdit(c.id)} className="h-8">تعديل</Button>}`
);

// We can replace the alert with a nice toast / local state if we want, but let's stick to the permissions for now.

fs.writeFileSync('src/pages/CustomersPage.tsx', code);
