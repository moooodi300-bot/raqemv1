const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');
code = code.replace(/       \} catch\(e\) \{\n        setAvailableServices\(\[\n            \{ id: '1', name: 'غسيل خارجي', price: 35 \},\n            \{ id: '2', name: 'غسيل داخلي وخارجي', price: 50 \},\n            \{ id: '3', name: 'غسيل بخار', price: 80 \},\n            \{ id: '4', name: 'تلميع ساطع', price: 250 \},\n        \]\);\n          \n    \};\n    fetchServices\(\);\n  \}, \[currentTenantId\]\);/g, 
`      } catch(e) {
        setAvailableServices([
            { id: '1', name: 'غسيل خارجي', price: 35 },
            { id: '2', name: 'غسيل داخلي وخارجي', price: 50 },
            { id: '3', name: 'غسيل بخار', price: 80 },
            { id: '4', name: 'تلميع ساطع', price: 250 },
        ]);
      }
    };
    fetchServices();
  }, [currentTenantId]);`);
fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
