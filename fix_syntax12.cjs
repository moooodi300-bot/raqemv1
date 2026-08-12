const fs = require('fs');
let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

code = code.replace(/setForm\(\{ customerName: '', phone: '', carType: '', plate: '', mileage: '', notes: '', selectedServices: \[\], photosCount: 0 \);/g, "setForm({ customerName: '', phone: '', carType: '', plate: '', mileage: '', notes: '', selectedServices: [], photosCount: 0 });");
code = code.replace(/setForm\(\{\.\.\.form, customerName: c\.name, phone: c\.phone \|\| '', plate: c\.plate_number \|\| '', carType: c\.vehicle_type \? c\.vehicle_type \+ ' ' \+ \(c\.vehicle_brand \|\| ''\) \+ ' ' \+ \(c\.vehicle_model \|\| ''\) : ''\);/g, "setForm({...form, customerName: c.name, phone: c.phone || '', plate: c.plate_number || '', carType: c.vehicle_type ? c.vehicle_type + ' ' + (c.vehicle_brand || '') + ' ' + (c.vehicle_model || '') : ''});");
code = code.replace(/setForm\(\{\.\.\.form, customerName: '', phone: ''\);/g, "setForm({...form, customerName: '', phone: ''});");
code = code.replace(/value=\{form\.carType onChange=\{e => setForm\(\{\.\.\.form, carType: e\.target\.value\}\)\} \/>/g, "value={form.carType} onChange={e => setForm({...form, carType: e.target.value})} />");
code = code.replace(/value=\{form\.plate onChange=\{e => setForm\(\{\.\.\.form, plate: e\.target\.value\}\)\} \/>/g, "value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} />");
code = code.replace(/value=\{form\.mileage onChange=\{e => setForm\(\{\.\.\.form, mileage: e\.target\.value\}\)\} \/>/g, "value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} />");
code = code.replace(/const srv = \{ id: 'custom-' \+ Date\.now\(\), name: customItem\.name, price: Number\(customItem\.price\) ;/g, "const srv = { id: 'custom-' + Date.now(), name: customItem.name, price: Number(customItem.price) };");
code = code.replace(/setForm\(\{\.\.\.form, selectedServices: \[\.\.\.form\.selectedServices, srv\]\);/g, "setForm({...form, selectedServices: [...form.selectedServices, srv]});");
code = code.replace(/setCustomItem\(\{ name: '', price: '' \);/g, "setCustomItem({ name: '', price: '' });");
code = code.replace(/setForm\(\{\.\.\.form, photosCount: form\.photosCount \+ 1\);/g, "setForm({...form, photosCount: form.photosCount + 1});");
code = code.replace(/<Textarea rows=\{3 value=\{form\.notes\}/g, "<Textarea rows={3} value={form.notes}");

fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
