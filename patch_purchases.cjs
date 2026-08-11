const fs = require('fs');
let code = fs.readFileSync('src/pages/PurchasesPage.tsx', 'utf8');

const target = `  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);`;
const replacement = `  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);`;
code = code.replace(target, replacement);

const loadTarget = `  const loadData = async () => {
    try {
      const stored = localStorage.getItem(\`tenant_purchases_\${currentTenantId}\`);
      if (stored) {
        setInvoices(JSON.parse(stored));
      } else {
        const { data, error } = await supabase.from('purchase_invoices').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setInvoices(data);
        } else {
          setInvoices([]);
        }
      }
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };`;

const loadReplacement = `  const loadData = async () => {
    try {
      setErrorMsg(null);
      const stored = localStorage.getItem(\`tenant_purchases_\${currentTenantId}\`);
      if (stored) {
        setInvoices(JSON.parse(stored));
      } else {
        const { data, error } = await supabase.from('purchase_invoices').select('*').order('created_at', { ascending: false });
        if (error) {
          if (error.message === 'Failed to fetch') {
            setErrorMsg('Request Failed: Unable to connect to database.');
          } else {
            setErrorMsg(error.message);
          }
          setInvoices([]);
        } else if (data) {
          setInvoices(data);
        } else {
          setInvoices([]);
        }
      }
    } catch (err: any) {
      setErrorMsg('Request Failed: ' + (err.message || 'Unknown error'));
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };`;
code = code.replace(loadTarget, loadReplacement);

const uiTarget = `  if (loading) return <Spinner label="جاري التحميل..." />;`;
const uiReplacement = `  if (loading) return <Spinner label="جاري التحميل..." />;
  if (errorMsg) return <div className="p-8 text-center text-rose-600 font-bold">{errorMsg}</div>;`;
code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/pages/PurchasesPage.tsx', code);
