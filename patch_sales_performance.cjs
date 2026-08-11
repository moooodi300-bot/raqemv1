const fs = require('fs');
let code = fs.readFileSync('src/pages/SalesPage.tsx', 'utf8');

// 1. We need to store all customers in a ref, and only show a subset
const importTarget = `import { useEffect, useState } from 'react';`;
const importReplacement = `import { useEffect, useState, useRef, useMemo } from 'react';`;
code = code.replace(importTarget, importReplacement);

const stateTarget = `const [customers, setCustomers] = useState<Customer[]>([]);`;
const stateReplacement = `const [customers, setCustomers] = useState<Customer[]>([]);
  const allCustomersRef = useRef<Customer[]>([]);
  const [displayedCustomers, setDisplayedCustomers] = useState<Customer[]>([]);`;
code = code.replace(stateTarget, stateReplacement);

const loadTarget = `setCustomers(loadedCu);`;
const loadReplacement = `setCustomers(loadedCu);
      allCustomersRef.current = loadedCu;
      setDisplayedCustomers(loadedCu.slice(0, 50));`;
code = code.replace(loadTarget, loadReplacement);

const filterTarget = `const filteredCustomers = customers.filter(
    (c) => c.name.includes(customerSearch) || (c.phone ?? '').includes(customerSearch) || (c.plate_number ?? '').includes(customerSearch)
  );`;
const filterReplacement = `const filteredCustomers = useMemo(() => {
    if (!customerSearch) return allCustomersRef.current.slice(0, 50);
    const searchLower = customerSearch.toLowerCase();
    return allCustomersRef.current.filter(
      (c) => c.name.toLowerCase().includes(searchLower) || (c.phone ?? '').includes(customerSearch) || (c.plate_number ?? '').toLowerCase().includes(searchLower)
    ).slice(0, 50);
  }, [customerSearch, allCustomersRef.current.length]);`;
code = code.replace(filterTarget, filterReplacement);

// We need to fix the case where the selected customer might not be in the displayed list
const selectedTarget = `const selectedCustomer = customers.find((c) => c.id === customerId) ?? null;`;
const selectedReplacement = `const selectedCustomer = allCustomersRef.current.find((c) => c.id === customerId) ?? null;`;
code = code.replace(selectedTarget, selectedReplacement);

fs.writeFileSync('src/pages/SalesPage.tsx', code);
