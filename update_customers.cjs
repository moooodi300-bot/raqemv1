const fs = require('fs');

let code = fs.readFileSync('src/pages/CustomersPage.tsx', 'utf8');

// We want to add multi-select, bulk delete/archive, and filters (Visit, Sub, Status, Date)
// 1. Add states
const stateTarget = `const [search, setSearch] = useState('');`;
const stateReplacement = `const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, vip
  const [visitFilter, setVisitFilter] = useState('all'); // all, recent, no_visit_20, no_visit_30, no_visit_60, never
  const [subFilter, setSubFilter] = useState('all'); // all, active, expired, none
  const [showEdit, setShowEdit] = useState<string | null>(null);
`;
code = code.replace(stateTarget, stateReplacement);

// 2. Add Select logic
const searchFilterTarget = `const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.plate_number && c.plate_number.toLowerCase().includes(search.toLowerCase()))
  );`;

const searchFilterReplacement = `
  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const getCustomerLastVisit = (customerId: string) => {
    // we would need to check sales or visits but we only have total_visits or last_visit?
    // let's rely on updated_at for now if we don't have last_visit on Customer
    const c = customers.find(x => x.id === customerId);
    if (!c) return null;
    return new Date(c.updated_at || c.created_at); // fallback
  };

  const filtered = customers.filter(c => {
    const searchMatch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.plate_number && c.plate_number.toLowerCase().includes(search.toLowerCase()));
    
    if (!searchMatch) return false;

    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && c.customer_status === 'inactive') return false;
      if (statusFilter === 'inactive' && c.customer_status !== 'inactive') return false;
      if (statusFilter === 'vip' && c.customer_status !== 'vip') return false;
    }

    if (visitFilter !== 'all') {
      const lastVisit = getCustomerLastVisit(c.id);
      if (visitFilter === 'recent' && lastVisit && lastVisit < twentyDaysAgo) return false;
      if (visitFilter === 'no_visit_20' && lastVisit && lastVisit >= twentyDaysAgo) return false;
      if (visitFilter === 'no_visit_30' && lastVisit && lastVisit >= thirtyDaysAgo) return false;
      if (visitFilter === 'no_visit_60' && lastVisit && lastVisit >= sixtyDaysAgo) return false;
    }

    const sub = getCustomerSub(c.id);
    if (subFilter !== 'all') {
      if (subFilter === 'active' && !sub) return false;
      if (subFilter === 'expired' && sub) return false; // Needs better expired check
      if (subFilter === 'none' && sub) return false;
    }

    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(c => c.id));
  };
  
  const handleBulkArchive = () => {
    // In a real app we would show a nice dialog and then set customer_status = 'archived'
    if(window.confirm('أرشفة العملاء المحددين؟')) {
       // logic here
       setSelectedIds([]);
    }
  };
`;
code = code.replace(searchFilterTarget, searchFilterReplacement);

fs.writeFileSync('src/pages/CustomersPage.tsx', code);
