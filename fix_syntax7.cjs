const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

// There's still a syntax error, probably in JobCardsPage at line 53. Let's find it.
// The error is `Parsing error: 'try' expected` which means there's a `catch(e) {` without a try, or we didn't fix `try {` properly.
// Wait, looking at lines 209-227, it looks like `try {` was before it. Let's look closer.
code = code.replace(/            try \{        const savedTrans/g, '            try {\n        const savedTrans');
code = code.replace(/    catch\(e\)/g, '    } catch(e)');
code = code.replace(/  ;/g, '  };');
// Let's replace the missing braces in handleWhatsAppWithPDF and generateReceiptPDF
code = code.replace(/`مرحباً \$\{card\.customerName،/g, '`مرحباً ${card.customerName}،');
code = code.replace(/سيارتك \(\$\{card\.carType\} - \$\{card\.plate\}\)/g, 'سيارتك (${card.carType} - ${card.plate})');
code = code.replace(/سيارتك \(\$\{card\.carType - \$\{card\.plate\}\)/g, 'سيارتك (${card.carType} - ${card.plate})');
code = code.replace(/رقم الكرت: \$\{card\.id\}/g, 'رقم الكرت: ${card.id}');
code = code.replace(/رقم الكرت: \$\{card\.id/g, 'رقم الكرت: ${card.id}');
code = code.replace(/إجمالي الفاتورة: \$\{card\.totalAmount\} ريال./g, 'إجمالي الفاتورة: ${card.totalAmount} ريال.');
code = code.replace(/إجمالي الفاتورة: \$\{card\.totalAmount ريال./g, 'إجمالي الفاتورة: ${card.totalAmount} ريال.');
code = code.replace(/https:\/\/wa\.me\/\$\{card\.phone\.replace\(\/\^0\/, '966'\)\}\?text=\$\{encodeURIComponent\(msg\)\}/g, "https://wa.me/${card.phone.replace(/^0/, '966')}?text=${encodeURIComponent(msg)}");
code = code.replace(/https:\/\/wa\.me\/\$\{card\.phone\.replace\(\/\^0\/, '966'\)\?text=\$\{encodeURIComponent\(msg\)\}/g, "https://wa.me/${card.phone.replace(/^0/, '966')}?text=${encodeURIComponent(msg)}");


code = code.replace(/setForm\(\{ \.\.\.form, selectedServices: form\.selectedServices\.filter\(s => s\.id !== srv\.id\) \);/g, 'setForm({ ...form, selectedServices: form.selectedServices.filter(s => s.id !== srv.id) });');
code = code.replace(/setForm\(\{ \.\.\.form, selectedServices: \[\.\.\.form\.selectedServices, srv\] \);/g, 'setForm({ ...form, selectedServices: [...form.selectedServices, srv] });');

code = code.replace(/\{ id: '1', name: 'غسيل خارجي', price: 35 ,/g, "{ id: '1', name: 'غسيل خارجي', price: 35 },");
code = code.replace(/\{ id: '2', name: 'غسيل داخلي وخارجي', price: 50 ,/g, "{ id: '2', name: 'غسيل داخلي وخارجي', price: 50 },");
code = code.replace(/\{ id: '3', name: 'غسيل بخار', price: 80 ,/g, "{ id: '3', name: 'غسيل بخار', price: 80 },");
code = code.replace(/\{ id: '4', name: 'تلميع ساطع', price: 250 ,/g, "{ id: '4', name: 'تلميع ساطع', price: 250 },");

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
