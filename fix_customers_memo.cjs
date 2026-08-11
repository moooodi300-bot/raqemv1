const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomersPage.tsx', 'utf8');

const target = `  if (loading) return <Spinner label={tr('loading', lang)} />;

  const filtered = useMemo(() => {
    let res = customers;
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(c => c.name.toLowerCase().includes(s) || (c.phone ?? '').includes(search) || (c.plate_number ?? '').toLowerCase().includes(s));
    }
    // Limit to 100 to avoid massive re-renders
    return res.slice(0, 100);
  }, [customers, search]);`;

const replacement = `  const filtered = useMemo(() => {
    let res = customers;
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(c => c.name.toLowerCase().includes(s) || (c.phone ?? '').includes(search) || (c.plate_number ?? '').toLowerCase().includes(s));
    }
    // Limit to 100 to avoid massive re-renders
    return res.slice(0, 100);
  }, [customers, search]);

  if (loading) return <Spinner label={tr('loading', lang)} />;`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/CustomersPage.tsx', code);
