const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/    localStorage\.setItem\(\`accounts_transactions_\$\{currentTenantId\}\`, JSON\.stringify\(transactions\)\);\n        \/\/ Save as a unified sale\n        const savedSales = localStorage\.getItem\(\`tenant_sales_\$\{currentTenantId\}\`\);\n        const sales = savedSales \? JSON\.parse\(savedSales\) : \[\];\n                \n        const saleItems = \(viewCard\.services \|\| \[\]\)\.map\(\(s: any\) => \(\{\n          item_id: s\.id,\n          name: s\.name,\n          qty: 1,\n          price: s\.price,\n          total: s\.price,\n          type: 'service'\n        \}\)\);\n                \n        sales\.push\(\{\n          id: \`sale-\$\{Date\.now\(\)\}\`,\n          created_at: new Date\(\)\.toISOString\(\),\n          total: cardTotal,\n          subtotal: cardTotal,\n          tax: 0,\n          payment_method: paymentMethod,\n          items: saleItems,\n          customer_id: '',\n          customer_name: viewCard\.customerName,\n          source: 'job_card'\n        \}\);\n        localStorage\.setItem\(\`tenant_sales_\$\{currentTenantId\}\`, JSON\.stringify\(sales\)\);/g, `    localStorage.setItem(\`accounts_transactions_\${currentTenantId}\`, JSON.stringify(transactions));
        // Save as a unified sale
        const savedSales = localStorage.getItem(\`tenant_sales_\${currentTenantId}\`);
        const sales = savedSales ? JSON.parse(savedSales) : [];
        
        const saleItems = (viewCard.services || []).map((s: any) => ({
          item_id: s.id,
          name: s.name,
          qty: 1,
          price: s.price,
          total: s.price,
          type: 'service'
        }));
        
        sales.push({
          id: \`sale-\${Date.now()}\`,
          created_at: new Date().toISOString(),
          total: cardTotal,
          subtotal: cardTotal,
          tax: 0,
          payment_method: paymentMethod,
          items: saleItems,
          customer_id: '',
          customer_name: viewCard.customerName,
          source: 'job_card'
        });
        localStorage.setItem(\`tenant_sales_\${currentTenantId}\`, JSON.stringify(sales));
      } catch (e) { console.error(e); }`);
fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
