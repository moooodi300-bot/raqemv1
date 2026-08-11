const fs = require('fs');
let code = fs.readFileSync('src/pages/InvoicesPage.tsx', 'utf8');

const importPdfTarget = `import jsPDF from 'jspdf';
import 'jspdf-autotable';`;
code = code.replace(importPdfTarget, '');

const funcTarget = `const generatePdf = (sale: Sale) => {
    const doc = new jsPDF();`;

const funcReplacement = `const generatePdf = async (sale: Sale) => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();`;
code = code.replace(funcTarget, funcReplacement);

const onClickTarget = `onClick={() => generatePdf(sale)}`;
const onClickReplacement = `onClick={async () => await generatePdf(sale)}`;
// Wait, we need to replace all `generatePdf(sale)` calls in InvoicesPage
code = code.replace(/onClick=\{\(\) => generatePdf\(sale\)\}/g, 'onClick={() => generatePdf(sale)}');

fs.writeFileSync('src/pages/InvoicesPage.tsx', code);
