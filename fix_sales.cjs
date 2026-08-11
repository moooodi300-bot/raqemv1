const fs = require('fs');
let code = fs.readFileSync('src/pages/SalesPage.tsx', 'utf8');

const targetMemo = `  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return allCustomersRef.current.slice(0, 50);
    const searchLower = customerSearch.toLowerCase();
    return allCustomersRef.current.filter(
      (c) => c.name.toLowerCase().includes(searchLower) || (c.phone ?? '').includes(customerSearch) || (c.plate_number ?? '').toLowerCase().includes(searchLower)
    ).slice(0, 50);
  }, [customerSearch, allCustomersRef.current.length]);`;

code = code.replace(targetMemo, "");

const insertTarget = `  if (loading) return <Spinner label={tr('loading', lang)} />;`;
const insertReplacement = `  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return allCustomersRef.current.slice(0, 50);
    const searchLower = customerSearch.toLowerCase();
    return allCustomersRef.current.filter(
      (c) => c.name.toLowerCase().includes(searchLower) || (c.phone ?? '').includes(customerSearch) || (c.plate_number ?? '').toLowerCase().includes(searchLower)
    ).slice(0, 50);
  }, [customerSearch, allCustomersRef.current]);

  if (loading) return <Spinner label={tr('loading', lang)} />;`;

code = code.replace(insertTarget, insertReplacement);

fs.writeFileSync('src/pages/SalesPage.tsx', code);
