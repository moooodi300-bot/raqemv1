const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/doc\.text\(\`- \$\{s\.name \(\$\{s\.price\} SAR\)\`, 30, y\);/g, "doc.text(`- ${s.name} (${s.price} SAR)`, 30, y);");
code = code.replace(/doc\.text\(\`Total: \$\{card\.totalAmount SAR\`, 20, y \+ 10\);/g, "doc.text(`Total: ${card.totalAmount} SAR`, 20, y + 10);");
code = code.replace(/doc\.save\(\`JobCard_\$\{card\.id_\$\{type\}\.pdf\`\);/g, "doc.save(`JobCard_${card.id}_${type}.pdf`);");

code = code.replace(/\{ name: 'غسيل VIP مخصوم من الاشتراك', price: 0 \]\}/g, "{ name: 'غسيل VIP مخصوم من الاشتراك', price: 0 }]}"); // just in case

code = code.replace(/doc\.text\(\`Customer: \$\{card\.customerName\`, 20, 50\);/g, "doc.text(`Customer: ${card.customerName}`, 20, 50);");
code = code.replace(/doc\.text\(\`Phone: \$\{card\.phone\`, 20, 60\);/g, "doc.text(`Phone: ${card.phone}`, 20, 60);");
code = code.replace(/doc\.text\(\`Job Card #: \$\{card\.id\`, 20, 80\);/g, "doc.text(`Job Card #: ${card.id}`, 20, 80);");
code = code.replace(/doc\.text\(\`Date: \$\{new Date\(card\.createdAt\)\.toLocaleString\('ar-SA'\)\`, 20, 90\);/g, "doc.text(`Date: ${new Date(card.createdAt).toLocaleString('ar-SA')}`, 20, 90);");

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
