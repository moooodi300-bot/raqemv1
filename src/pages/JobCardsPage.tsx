import { useState, useEffect } from 'react';
import { PageHeader, Card, CardBody, Button, Input, Label, Modal, Textarea } from '@/components/ui';
import { ComprehensiveDashboard } from '@/components/ComprehensiveDashboard';
import { Plus, Car, UserCircle, Camera, CheckCircle2, Printer, Send, Clock, Check, ListChecks } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { mergeCustomerLists, saveLocalCustomer } from '@/lib/customerStore';
import { getTenantProducts } from '@/lib/productStore';
import { consumeSubscriptionWash, getTenantCustomerSubscriptions } from '@/lib/subscriptionStore';
import { useAuth, usePermissions } from '@/lib/auth';
import type { Customer } from '@/lib/types';
import { Search, X, MessageCircle } from 'lucide-react';
import { JobCardCreator } from '@/components/JobCardCreator';

type JobStatus = 'waiting' | 'in_progress' | 'completed' | 'paid' | 'delivered';

interface JobCard {
  policy_text?: string;
  policy_accepted?: boolean;
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  carType: string;
  plate: string;
  mileage: string;
  notes: string;
  status: JobStatus;
  photosCount: number;
  totalAmount: number;
  createdAt: string;
  staffId?: string;
  staffName?: string;
  services: any[];
}

export function JobCardsPage() {
  const { organization, settings, activeEmployee } = useAuth();
  const { can } = usePermissions();
  const currentTenantId = organization?.id || 'org_client_01';
  const [cards, setCards] = useState<JobCard[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  const [activeFilter, setActiveFilter] = useState<JobStatus>('in_progress');
  const [showAdd, setShowAdd] = useState(false);
  const [viewCard, setViewCard] = useState<JobCard | null>(null);
  
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customItem, setCustomItem] = useState({ name: '', price: '' });

  useEffect(() => {
    const saved = localStorage.getItem(`job_cards_${currentTenantId}`);
    if (saved) {
      setCards(JSON.parse(saved));
    } else {
      setCards([
        { id: 'JC-1001', customerId: 'c-1', customerName: 'عبدالله محمد الشمري', phone: '0501112233', carType: 'تويوتا كامري 2023', plate: 'أ ح د 1234', mileage: '45000', notes: 'يوجد خدش بسيط في الصدام الأمامي الأيمن قبل البدء', status: 'in_progress', photosCount: 4, totalAmount: 125, createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), services: [{ name: 'غسيل شامل وساطع VIP', price: 75 }, { name: 'معطر جو فاخر واكس', price: 50 }] },
        { id: 'JC-1002', customerId: 'c-4', customerName: 'سعد القحطاني', phone: '0554445566', carType: 'نيسان باترول 2024', plate: 'ث ج ح 4444', mileage: '12000', notes: 'طلب التركيز على تلميع الجنوط والمراتب الجلدية', status: 'completed', photosCount: 6, totalAmount: 350, createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), services: [{ name: 'تلميع ساطع نانو سيراميك', price: 350 }] },
        { id: 'JC-1003', customerId: 'c-2', customerName: 'فيصل عبدالرحمن الدوسري', phone: '0562223344', carType: 'مرسيدس E-Class 2022', plate: 'ب ت ث 2222', mileage: '38000', notes: 'خصم غسلة كرت العمل من رصيد الاشتراك الفعال', status: 'paid', photosCount: 3, totalAmount: 0, createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), services: [{ name: 'غسيل VIP مخصوم من الاشتراك', price: 0 }] },
      ]);
    }
    
    // load services & customers
    const fetchServices = async () => {
      try {
        const prods = await getTenantProducts(currentTenantId);
        setAvailableServices(prods.filter(p => p.active !== false));
        
        setCustomers(mergeCustomerLists([], currentTenantId));
      } catch(e) {
        setAvailableServices([
            { id: '1', name: 'غسيل خارجي', price: 35 },
            { id: '2', name: 'غسيل داخلي وخارجي', price: 50 },
            { id: '3', name: 'غسيل بخار', price: 80 },
            { id: '4', name: 'تلميع ساطع', price: 250 },
        ]);
      }
    };
    fetchServices();
  }, [currentTenantId]);

  const saveCards = (newCards: JobCard[]) => {
    setCards(newCards);
    localStorage.setItem(`job_cards_${currentTenantId}`, JSON.stringify(newCards));
  };

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    carType: '',
    plate: '',
    mileage: '',
    notes: '',
    selectedServices: [] as any[],
    photosCount: 0
  });

  const handleCreate = () => {
    // Sync customer
    const custId = selectedCustomerId || `cust-${Date.now()}`;
    const newCust = {
      id: custId,
      name: form.customerName,
      phone: form.phone,
      plate_number: form.plate,
      vehicle_type: form.carType,
      created_at: new Date().toISOString()
    };
    saveLocalCustomer(newCust as any, currentTenantId);
    setCustomers(mergeCustomerLists([], currentTenantId));

    const totalAmount = form.selectedServices.reduce((sum, s) => sum + s.price, 0);
    const newCard: JobCard = {
      id: `JC-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: custId,
      ...form,
      status: 'waiting',
      totalAmount,
      services: form.selectedServices,
      createdAt: new Date().toISOString(),
      staffId: activeEmployee?.id,
      staffName: activeEmployee?.name
    };
    saveCards([newCard, ...cards]);
    setShowAdd(false);
    setForm({ customerName: '', phone: '', carType: '', plate: '', mileage: '', notes: '', selectedServices: [], photosCount: 0 });
  };

  const sendWhatsApp = (phone: string, template?: string) => {
    if (!template || !phone) return;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(template)}`;
    window.open(url, '_blank');
  };

  const handleChangeStatus = (id: string, newStatus: JobStatus, cardTotal: number, paymentMethod: string = 'pos') => {
    saveCards(cards.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    if (newStatus === 'paid') {
      if (paymentMethod === 'subscription') {
         const cSubs = getTenantCustomerSubscriptions(currentTenantId);
         const cSub = cSubs.find(s => s.customer_name === viewCard?.customerName || s.plate_number === viewCard?.plate);
         if (cSub) {
            consumeSubscriptionWash(cSub.id, `غسيل كرت عمل ${id}`, currentTenantId);
         } else {
            alert('لا يوجد اشتراك فعال لهذا العميل. تم التسجيل كاشتراك ولكن يرجى مراجعة الرصيد.');
         }
      }
      try {
        const savedTrans = localStorage.getItem(`accounts_transactions_${currentTenantId}`);
        const transactions = savedTrans ? JSON.parse(savedTrans) : [];
        transactions.push({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          description: `إيراد غسيل - كرت ${id}`,
          type: 'in',
          paymentMethod: paymentMethod,
          amount: cardTotal
        });
        localStorage.setItem(`accounts_transactions_${currentTenantId}`, JSON.stringify(transactions));

        // Save as a unified sale
        const savedSales = localStorage.getItem(`tenant_sales_${currentTenantId}`);
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
          id: `sale-${Date.now()}`,
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
        localStorage.setItem(`tenant_sales_${currentTenantId}`, JSON.stringify(sales));

      } catch(e) {}
    }
    setViewCard(null);
  };

  const filteredCards = cards.filter(c => c.status === activeFilter);

  
  const generateReceiptPDF = async (card: JobCard, type: 'receipt' | 'invoice') => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      doc.setFontSize(20);
      doc.text(settings?.company_name || 'Raqam POS', 105, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text(type === 'receipt' ? 'Vehicle Receipt' : 'Final Invoice', 105, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Customer: ${card.customerName}`, 20, 50);
      doc.text(`Phone: ${card.phone}`, 20, 60);
      doc.text(`Car: ${card.carType} - ${card.plate}`, 20, 70);
      doc.text(`Job Card #: ${card.id}`, 20, 80);
      doc.text(`Date: ${new Date(card.createdAt).toLocaleString('en-US')}`, 20, 90);
      doc.text(`Staff: ${activeEmployee?.name || 'Owner'}`, 20, 100);
      
      doc.text(`Services:`, 20, 120);
      let y = 130;
      card.services?.forEach((s: any) => {
         doc.text(`- ${s.name} (${s.price} SAR)`, 30, y);
         y += 10;
      });
      
      doc.text(`Total Amount: ${card.totalAmount} SAR`, 20, y + 10);
      
      doc.save(`JobCard_${card.id}_${type}.pdf`);
    } catch(e) {
      console.error('PDF generation failed', e);
    }
  };

  const handleWhatsAppWithPDF = async (card: JobCard, type: 'receipt' | 'invoice') => {
    await generateReceiptPDF(card, type);
    const msg = type === 'receipt' ? `Hello ${card.customerName},
Your vehicle (${card.carType} - ${card.plate}) has been received successfully.
Job Card #: ${card.id}
(Receipt document is attached)` : `Hello ${card.customerName},
Work on your vehicle (${card.carType} - ${card.plate}) is completed.
Total Invoice: ${card.totalAmount} SAR.
(Final Invoice document is attached)`;
    const url = `https://wa.me/${card.phone.replace(/^0/, '966')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };
const toggleService = (srv: any) => {
    if (form.selectedServices.find(s => s.id === srv.id)) {
      setForm({ ...form, selectedServices: form.selectedServices.filter(s => s.id !== srv.id) });
    } else {
      if (form.selectedServices.length >= 10) return; // Max 10
      setForm({ ...form, selectedServices: [...form.selectedServices, srv] });
    }
  };

  const formTotal = form.selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="كروت العمل"
        subtitle="إنشاء ومتابعة كروت الفحص والخدمات للسيارات"
        action={
          can('workcards.create') ? (
            <Button onClick={() => setShowAdd(true)} className="bg-primary-600 hover:bg-primary-700 font-bold">
              <Plus className="w-4 h-4 ml-2" /> كرت عمل جديد
            </Button>
          ) : undefined
        }
      />
      
      <div className="flex bg-surface-100 p-1 rounded-xl w-full max-w-sm mb-6">
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'list' ? 'bg-white shadow-sm text-primary-800' : 'text-surface-500 hover:bg-surface-200/50'}`}>الكروت</button>
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-primary-800' : 'text-surface-500 hover:bg-surface-200/50'}`}>لوحة المؤشرات</button>
      </div>

      {activeTab === 'list' && (
      <>
      {/* Tabs Outside the Card */}
      <div className="flex flex-wrap gap-2 bg-surface-100 p-1 rounded-xl w-full">
        <button onClick={() => setActiveFilter('waiting')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeFilter === 'waiting' ? 'bg-white shadow-sm text-primary-800' : 'text-surface-500 hover:bg-surface-200/50'}`}>الانتظار</button>
        <button onClick={() => setActiveFilter('in_progress')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeFilter === 'in_progress' ? 'bg-white shadow-sm text-primary-800' : 'text-surface-500 hover:bg-surface-200/50'}`}>جاري العمل</button>
        <button onClick={() => setActiveFilter('completed')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeFilter === 'completed' ? 'bg-white shadow-sm text-primary-800' : 'text-surface-500 hover:bg-surface-200/50'}`}>مكتمل</button>
        <button onClick={() => setActiveFilter('paid')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeFilter === 'paid' ? 'bg-white shadow-sm text-primary-800' : 'text-surface-500 hover:bg-surface-200/50'}`}>تم الدفع</button>
        <button onClick={() => setActiveFilter('delivered')} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeFilter === 'delivered' ? 'bg-white shadow-sm text-primary-800' : 'text-surface-500 hover:bg-surface-200/50'}`}>تم التسليم</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => (
          <Card key={card.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-t-primary-500" onClick={() => setViewCard(card)}>
            <CardBody className="p-5 relative">
              <div className={`absolute top-4 left-4 text-xs font-bold px-2 py-1 rounded-md ${card.status === 'waiting' ? 'bg-amber-100 text-amber-800' : card.status === 'in_progress' ? 'bg-primary-100 text-primary-800' : card.status === 'completed' ? 'bg-indigo-100 text-indigo-800' : card.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-200 text-surface-800'}`}>
                {card.status === 'waiting' ? 'الانتظار' : card.status === 'in_progress' ? 'جاري العمل' : card.status === 'completed' ? 'مكتمل' : card.status === 'paid' ? 'تم الدفع' : 'تم التسليم'}
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="font-mono font-bold text-surface-500">{card.id}</div>
              </div>
              <h3 className="text-lg font-black text-surface-900 mb-1">{card.carType}</h3>
              <div className="flex gap-2 mb-4">
                <span className="text-xs font-mono bg-surface-100 text-surface-600 px-2 py-1 rounded border border-surface-200">{card.plate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-600 mb-2 border-t border-surface-100 pt-4">
                <UserCircle className="w-4 h-4" /> {card.customerName} - {card.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-500 mb-4">
                الموظف: {card.staffName || 'غير محدد'}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <Camera className="w-3.5 h-3.5" /> {card.photosCount} صور مرفقة
                </div>
                <div className="font-black text-primary-700">{card.totalAmount} ريال</div>
              </div>
            </CardBody>
          </Card>
        ))}
        {filteredCards.length === 0 && (
          <div className="col-span-full py-12 text-center text-surface-400 bg-surface-50 rounded-2xl border-2 border-dashed border-surface-200">
            <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">لا توجد كروت عمل بهذه الحالة</p>
          </div>
        )}
      </div>

            <JobCardCreator 
        open={showAdd} 
        onClose={() => setShowAdd(false)} 
        currentTenantId={currentTenantId}
        customers={customers}
        availableServices={availableServices}
        settings={settings}
        onJobCardCreated={(card) => {
            saveCards([card, ...cards]);
            // the modal inside JobCardCreator will stay open for success state,
            // we let the user close it from there, which will trigger onClose
        }}
      />

      <Modal open={!!viewCard} onClose={() => setViewCard(null)} title={`تفاصيل كرت العمل - ${viewCard?.id}`} size="md">
        {viewCard && (
          <div className="space-y-6">
             <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 space-y-3">
               <div className="flex justify-between">
                 <span className="text-surface-500">العميل:</span>
                 <span className="font-bold text-surface-900">{viewCard.customerName}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-surface-500">الجوال:</span>
                 <span className="font-bold font-mono text-surface-900">{viewCard.phone}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-surface-500">السيارة:</span>
                 <span className="font-bold text-surface-900">{viewCard.carType} ({viewCard.plate})</span>
               </div>
               {viewCard.services && viewCard.services.length > 0 && (
                 <div className="mt-3 pt-3 border-t border-surface-200">
                   <p className="text-xs font-bold text-surface-700 mb-2">الخدمات المطلوبة:</p>
                   <ul className="space-y-1">
                     {viewCard.services.map((s, idx) => (
                       <li key={idx} className="flex justify-between text-sm">
                         <span>{s.name}</span>
                         <span className="font-bold">{s.price} ريال</span>
                       </li>
                     ))}
                   </ul>
                   <div className="flex justify-between items-center mt-3 pt-2 border-t border-surface-200 font-black">
                     <span>الإجمالي</span>
                     <span className="text-primary-700">{viewCard.totalAmount} ريال</span>
                   </div>
                 </div>
               )}
               {viewCard.notes && (
                 <div className="mt-3 pt-3 border-t border-surface-200">
                   <p className="text-xs font-bold text-rose-600 mb-1">ملاحظات الفحص:</p>
                   <p className="text-sm text-surface-700">{viewCard.notes}</p>
                 </div>
               )}
             </div>
             
             {viewCard.status === 'waiting' && (
               <div className="pt-4 border-t border-surface-100 space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                   <Button onClick={() => generateReceiptPDF(viewCard, 'receipt')} variant="outline" className="border-surface-200 text-surface-700 hover:bg-surface-50 text-xs">
                     <Printer className="w-4 h-4 ml-2" /> تقرير PDF
                   </Button>
                   {can('workcards.whatsapp') && <Button onClick={() => handleWhatsAppWithPDF(viewCard, 'receipt')} variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs">
                     <MessageCircle className="w-4 h-4 ml-2" /> واتساب
                   </Button>}
                 </div>
                 {can('workcards.status') && <Button onClick={() => handleChangeStatus(viewCard.id, 'in_progress', viewCard.totalAmount)} className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-900/20">
                   <Clock className="w-5 h-5 ml-2" /> بدء العمل (تغيير الحالة)
                 </Button>}
               </div>
             )}

             {viewCard.status === 'in_progress' && (
               <div className="pt-4 border-t border-surface-100 space-y-3">
                 {can('workcards.whatsapp') && <Button onClick={() => sendWhatsApp(viewCard.phone, settings?.whatsapp_in_progress)} variant="outline" className="w-full text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                   <MessageCircle className="w-4 h-4 ml-2" /> إشعار واتساب (جاري العمل)
                 </Button>}
                 {can('workcards.status') && <Button onClick={() => handleChangeStatus(viewCard.id, 'completed', viewCard.totalAmount)} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-900/20">
                   <CheckCircle2 className="w-5 h-5 ml-2" /> تم الانتهاء من العمل
                 </Button>}
               </div>
             )}

             {viewCard.status === 'completed' && (
               <div className="pt-4 border-t border-surface-100 space-y-3">
                 {can('workcards.whatsapp') && <Button onClick={() => sendWhatsApp(viewCard.phone, settings?.whatsapp_completed)} variant="outline" className="w-full text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                   <MessageCircle className="w-4 h-4 ml-2" /> إشعار واتساب (العمل مكتمل)
                 </Button>}
                 {can('workcards.status') && (
                    <div className="bg-surface-50 p-3 rounded-xl border border-surface-100 space-y-2">
                       <Label className="text-sm font-bold text-surface-800 text-center block mb-2">اختر طريقة السداد لإتمام الدفع</Label>
                       <div className="grid grid-cols-5 gap-2">
                          <Button onClick={() => handleChangeStatus(viewCard.id, 'paid', viewCard.totalAmount, 'cash')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1">كاش</Button>
                          <Button onClick={() => handleChangeStatus(viewCard.id, 'paid', viewCard.totalAmount, 'card')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1">شبكة</Button>
                          <Button onClick={() => handleChangeStatus(viewCard.id, 'paid', viewCard.totalAmount, 'transfer')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1">تحويل</Button>
                          <Button onClick={() => handleChangeStatus(viewCard.id, 'paid', viewCard.totalAmount, 'split')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1">مقسم</Button>
                          <Button onClick={() => handleChangeStatus(viewCard.id, 'paid', viewCard.totalAmount, 'subscription')} className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] px-1">اشتراك</Button>
</div>
                    </div>
                 )}
               </div>
             )}

             {viewCard.status === 'paid' && (
               <div className="pt-4 border-t border-surface-100 space-y-3">
                 {can('workcards.status') && <Button onClick={() => handleChangeStatus(viewCard.id, 'delivered', viewCard.totalAmount)} className="w-full h-12 bg-surface-800 hover:bg-surface-900 text-white font-bold text-base shadow-lg shadow-surface-900/20">
                   <Car className="w-5 h-5 ml-2" /> تسليم السيارة
                 </Button>}
                 <div className="grid grid-cols-2 gap-3 pt-2">
                   <Button onClick={() => handleWhatsAppWithPDF(viewCard, 'invoice')} variant="outline" className="h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50">
                     <MessageCircle className="w-4 h-4 ml-2" /> واتساب + فاتورة
                   </Button>
                   <Button onClick={() => generateReceiptPDF(viewCard, 'invoice')} variant="outline" className="h-10">
                     <Printer className="w-4 h-4 ml-2" /> طباعة فاتورة PDF
                   </Button>
                 </div>
               </div>
             )}

             {viewCard.status === 'delivered' && (
               <div className="pt-4 border-t border-surface-100 space-y-3">
                 {can('workcards.whatsapp') && <Button onClick={() => sendWhatsApp(viewCard.phone, settings?.whatsapp_delivered)} variant="outline" className="w-full text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                   <MessageCircle className="w-4 h-4 ml-2" /> إشعار واتساب (تم التسليم)
                 </Button>}
                 <div className="p-3 bg-surface-100 text-surface-500 text-center rounded-xl text-sm font-medium">
                    السيارة مسلمة
                 </div>
               </div>
             )}
          </div>
        )}
      </Modal>
      </>
      )}
      
      {activeTab === 'dashboard' && (
        <ComprehensiveDashboard sourceFilter="job_card" title="مؤشرات كروت العمل" />
      )}
    </div>
  );
}
