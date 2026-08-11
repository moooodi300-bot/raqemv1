const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomersPage.tsx', 'utf8');

const filterTarget = `  const filtered = customers.filter(
    (c) => c.name.includes(search) || (c.phone ?? '').includes(search) || (c.plate_number ?? '').includes(search)
  );`;

const filterReplacement = `  const filtered = useMemo(() => {
    let res = customers;
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(c => c.name.toLowerCase().includes(s) || (c.phone ?? '').includes(search) || (c.plate_number ?? '').toLowerCase().includes(s));
    }
    // Limit to 100 to avoid massive re-renders
    return res.slice(0, 100);
  }, [customers, search]);`;
code = code.replace(filterTarget, filterReplacement);

fs.writeFileSync('src/pages/CustomersPage.tsx', code);
