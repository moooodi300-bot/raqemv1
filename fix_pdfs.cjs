const fs = require('fs');

// 1. Update JobCardsPage.tsx
let jobCardsCode = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

const generatePDFRegex = /const generateReceiptPDF = async [\s\S]*?alert\('حدث خطأ أثناء إنشاء PDF'\);\n    \}\n  \};/g;

const newGeneratePDF = `const generateReceiptPDF = async (card: JobCard, type: 'receipt' | 'invoice') => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      doc.setFontSize(20);
      doc.text(settings?.company_name || 'Raqam POS', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text(type === 'receipt' ? 'Vehicle Receipt' : 'Final Invoice', 105, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(\`Customer: \${card.customerName}\`, 20, 50);
      doc.text(\`Phone: \${card.phone}\`, 20, 60);
      doc.text(\`Car: \${card.carType} - \${card.plate}\`, 20, 70);
      doc.text(\`Job Card #: \${card.id}\`, 20, 80);
      doc.text(\`Date: \${new Date(card.createdAt).toLocaleString('en-US')}\`, 20, 90);
      doc.text(\`Staff: \${activeEmployee?.name || 'Owner'}\`, 20, 100);
      
      doc.text(\`Services:\`, 20, 120);
      let y = 130;
      card.services?.forEach((s: any) => {
         doc.text(\`- \${s.name} (\${s.price} SAR)\`, 30, y);
         y += 10;
      });
      
      doc.text(\`Total Amount: \${card.totalAmount} SAR\`, 20, y + 10);
      
      doc.save(\`JobCard_\${card.id}_\${type}.pdf\`);
    } catch(e) {
      console.error('PDF generation failed', e);
    }
  };`;

jobCardsCode = jobCardsCode.replace(generatePDFRegex, newGeneratePDF);

const handleWhatsAppRegex = /const handleWhatsAppWithPDF = async [\s\S]*?window\.open\(url, '_blank'\);\n  \};/g;
const newHandleWhatsApp = `const handleWhatsAppWithPDF = async (card: JobCard, type: 'receipt' | 'invoice') => {
    await generateReceiptPDF(card, type);
    const msg = type === 'receipt' ? \`Hello \${card.customerName},
Your vehicle (\${card.carType} - \${card.plate}) has been received successfully.
Job Card #: \${card.id}
(Receipt document is attached)\` : \`Hello \${card.customerName},
Work on your vehicle (\${card.carType} - \${card.plate}) is completed.
Total Invoice: \${card.totalAmount} SAR.
(Final Invoice document is attached)\`;
    const url = \`https://wa.me/\${card.phone.replace(/^0/, '966')}?text=\${encodeURIComponent(msg)}\`;
    window.open(url, '_blank');
  };`;

jobCardsCode = jobCardsCode.replace(handleWhatsAppRegex, newHandleWhatsApp);

fs.writeFileSync('src/pages/JobCardsPage.tsx', jobCardsCode);


// 2. Update JobCardCreator.tsx
let creatorCode = fs.readFileSync('src/components/JobCardCreator.tsx', 'utf8');

const creatorPDFRegex = /const handleGeneratePDF = async [\s\S]*?console\.error\('PDF generation failed', e\);\n        \}\n    \};/g;
const newCreatorPDF = `const handleGeneratePDF = async (card: any) => {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            doc.setFontSize(22);
            doc.text(settings?.company_name || 'Raqam POS', 105, 20, { align: 'center' });
            
            doc.setFontSize(14);
            doc.text(\`JOB CARD #\${card.id}\`, 105, 30, { align: 'center' });
            
            doc.setFontSize(12);
            let y = 45;
            
            // Customer Info
            doc.setFontSize(14);
            doc.text('Customer Information', 20, y);
            doc.setFontSize(11);
            doc.text(\`Name: \${card.customerName}\`, 20, y+8);
            doc.text(\`Phone: \${card.phone}\`, 20, y+14);
            
            // Vehicle Info
            doc.setFontSize(14);
            doc.text('Vehicle Information', 120, y);
            doc.setFontSize(11);
            doc.text(\`Vehicle: \${card.carType}\`, 120, y+8);
            doc.text(\`Color: \${card.carColor || '-'}\`, 120, y+14);
            doc.text(\`Plate: \${card.plate || '-'}\`, 120, y+20);
            
            y += 35;
            
            // Services
            doc.setFontSize(14);
            doc.text('Services', 20, y);
            doc.setFontSize(11);
            y += 8;
            card.services.forEach((s: any) => {
               doc.text(\`- \${s.name}\`, 20, y);
               doc.text(\`\${s.price} SAR\`, 170, y, { align: 'right' });
               y += 8;
            });
            
            // Payment
            y += 5;
            doc.setFontSize(14);
            doc.text('Payment Summary', 20, y);
            doc.setFontSize(11);
            y += 8;
            doc.text(\`Subtotal: \${subtotal} SAR\`, 20, y); y += 6;
            if(discount > 0) { doc.text(\`Discount: \${discount} SAR\`, 20, y); y += 6; }
            if(deposit > 0) { doc.text(\`Deposit: \${deposit} SAR\`, 20, y); y += 6; }
            doc.text(\`Remaining: \${remaining} SAR\`, 20, y); y += 6;
            doc.setFontSize(12);
            doc.text(\`Total: \${card.totalAmount} SAR\`, 20, y+2); y += 15;
            
            // Policy
            if (card.policy_text) {
                doc.setFontSize(14);
                doc.text('Service Policy & Warranty', 20, y);
                doc.setFontSize(9);
                y += 8;
                
                // Wrap text
                const splitText = doc.splitTextToSize(card.policy_text, 170);
                doc.text(splitText, 20, y);
                y += (splitText.length * 4) + 10;
                
                doc.setFontSize(11);
                doc.text('Customer Acceptance:', 20, y);
                doc.text(\`[ X ] I have read and accept the service policy.\`, 20, y+8);
                doc.text(\`Date: \${new Date(card.createdAt).toLocaleString('en-US')}\`, 20, y+14);
                doc.text(\`Staff: Owner\`, 20, y+20);
            }
            
            doc.save(\`JobCard_\${card.id}.pdf\`);
        } catch(e) {
            console.error('PDF generation failed', e);
        }
    };`;

creatorCode = creatorCode.replace(creatorPDFRegex, newCreatorPDF);

fs.writeFileSync('src/components/JobCardCreator.tsx', creatorCode);
