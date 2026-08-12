import { useState, useEffect } from 'react';
import { Modal, Button, Input, Label, Textarea } from '@/components/ui';
import { Search, Plus, Car, CheckCircle2, ChevronRight, ChevronLeft, Shield, DollarSign, Edit, AlertCircle, FileText } from 'lucide-react';
import type { Customer, CustomerVehicle, JobCard } from '@/lib/types';
import { getTenantCustomers, saveLocalCustomer } from '@/lib/customerStore';
import { getTenantProducts } from '@/lib/productStore';
import { saveSale } from '@/lib/salesStore';
import { useAuth } from '@/lib/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: JobCard) => void;
}

export function CreateJobCardWizard({ isOpen, onClose, onSave }: Props) {
  const { organization, settings, activeEmployee } = useAuth();
  const tenantId = organization?.id || 'org_client_01';
  
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  
  // Data state
  const [customer, setCustomer] = useState<Partial<Customer> | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [vehicle, setVehicle] = useState<Partial<CustomerVehicle> | null>(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [deposit, setDeposit] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [photosCount, setPhotosCount] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setCustomers(getTenantCustomers(tenantId));
      setAvailableProducts(getTenantProducts(tenantId).filter(p => p.type === 'service' || p.type === 'package'));
      setStep(1);
      setCustomer(null);
      setVehicle(null);
      setSelectedServices([]);
      setNotes('');
      setDeposit(0);
      setDiscount(0);
      setPolicyAccepted(false);
      setPhotosCount(0);
      setIsNewCustomer(false);
      setIsNewVehicle(false);
      setSearchQuery('');
    }
  }, [isOpen, tenantId]);
  
  // Steps Navigation
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const subtotal = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalAmount = Math.max(0, subtotal - discount);
  const remaining = Math.max(0, totalAmount - deposit);
  
  const handleSave = () => {
    // 1. Validate & Save Customer
    let finalCustomerId = customer?.id;
    if (isNewCustomer || !finalCustomerId) {
      finalCustomerId = `cust-${Date.now()}`;
      const newCust = {
        id: finalCustomerId,
        name: customer?.name || 'عميل جديد',
        phone: customer?.phone || '',
        email: customer?.email || '',
        vehicles: [],
        created_at: new Date().toISOString(),
        loyalty_stamps: 0,
        free_washes_earned: 0
      } as Customer;
      
      saveLocalCustomer(newCust, tenantId);
    }
    
    // 2. Add Vehicle if new
    // We update the customer record if there's a new vehicle
    if (isNewVehicle && vehicle && finalCustomerId) {
       const allCusts = getTenantCustomers(tenantId);
       const existingCust = allCusts.find(c => c.id === finalCustomerId);
       if (existingCust) {
          const newVeh = {
             id: `veh-${Date.now()}`,
             plate_number: vehicle.plate_number || '',
             vehicle_type: vehicle.vehicle_type || '',
             vehicle_brand: vehicle.vehicle_brand || '',
             vehicle_color: vehicle.vehicle_color || ''
          };
          existingCust.vehicles = [...(existingCust.vehicles || []), newVeh];
          existingCust.plate_number = newVeh.plate_number; // primary
          existingCust.vehicle_type = newVeh.vehicle_type;
          existingCust.vehicle_color = newVeh.vehicle_color;
          saveLocalCustomer(existingCust, tenantId);
       }
    }
    
    // 3. Create Job Card
    const newCard: JobCard = {
      id: `JC-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: finalCustomerId,
      customerName: customer?.name || '',
      phone: customer?.phone || '',
      carType: vehicle?.vehicle_type || '',
      plate: vehicle?.plate_number || '',
      vehicleColor: vehicle?.vehicle_color || '',
      mileage: '',
      notes,
      status: 'waiting',
      photosCount,
      subtotal,
      discount,
      deposit,
      remaining,
      totalAmount,
      paymentStatus: remaining === 0 ? 'paid' : (deposit > 0 ? 'partially_paid' : 'unpaid'),
      policy_snapshot: settings?.service_policy || '',
      policy_accepted: policyAccepted,
      createdAt: new Date().toISOString(),
      staffId: activeEmployee?.id,
      staffName: activeEmployee?.name,
      services: selectedServices
    };
    
    onSave(newCard);
  };
  
  return (
    <Modal open={isOpen} onClose={onClose} title="إنشاء كرت عمل جديد" size="xl">
      <div className="flex h-[75vh] flex-col md:flex-row gap-6">
        {/* Sidebar Steps */}
        <div className="w-full md:w-1/4 bg-surface-50 p-4 rounded-xl space-y-2 border border-surface-200">
          {[
            { s: 1, label: 'العميل', icon: UserCircle },
            { s: 2, label: 'المركبة', icon: Car },
            { s: 3, label: 'الخدمات', icon: Plus },
            { s: 4, label: 'الدفع والتسعير', icon: DollarSign },
            { s: 5, label: 'السياسة والضمان', icon: Shield },
            { s: 6, label: 'الملاحظات', icon: FileText },
            { s: 7, label: 'حفظ وإصدار', icon: CheckCircle2 },
          ].map(item => (
             <div key={item.s} className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${step === item.s ? 'bg-primary-600 text-white shadow-md' : (step > item.s ? 'bg-primary-100 text-primary-700' : 'text-surface-500 hover:bg-surface-100')}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {step > item.s && <CheckCircle2 className="w-4 h-4 mr-auto" />}
             </div>
          ))}
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
           <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-6">
              
              {/* STEP 1: CUSTOMER */}
              {step === 1 && (
                 <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-xl font-bold text-surface-900 border-b pb-2">بيانات العميل</h3>
                    
                    {!isNewCustomer ? (
                       <div className="space-y-4">
                          <div className="relative">
                            <Search className="w-5 h-5 absolute right-3 top-3 text-surface-400" />
                            <Input placeholder="ابحث برقم الجوال، الاسم، أو اللوحة..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10" />
                          </div>
                          
                          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                            {customers.filter(c => (c.name?.includes(searchQuery) || c.phone?.includes(searchQuery) || c.plate_number?.includes(searchQuery))).slice(0,5).map(c => (
                               <div key={c.id} onClick={() => { setCustomer(c); setIsNewCustomer(false); nextStep(); }} className="p-4 border rounded-xl hover:border-primary-500 hover:bg-primary-50 cursor-pointer flex justify-between items-center transition-all">
                                  <div>
                                     <p className="font-bold text-surface-900">{c.name}</p>
                                     <p className="text-sm text-surface-500">{c.phone}</p>
                                  </div>
                                  <ChevronLeft className="text-primary-400" />
                               </div>
                            ))}
                          </div>
                          
                          <Button onClick={() => { setIsNewCustomer(true); setCustomer({ name: '', phone: '' }); }} variant="outline" className="w-full h-12 border-dashed border-2">
                            <Plus className="w-5 h-5 ml-2" /> إضافة عميل جديد
                          </Button>
                       </div>
                    ) : (
                       <div className="space-y-4 bg-surface-50 p-6 rounded-2xl border border-surface-200">
                          <div>
                            <Label>الاسم الكامل *</Label>
                            <Input value={customer?.name || ''} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="مثال: أحمد محمد" />
                          </div>
                          <div>
                            <Label>رقم الجوال *</Label>
                            <Input value={customer?.phone || ''} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="05XXXXXXXX" />
                          </div>
                          <div>
                            <Label>البريد الإلكتروني (اختياري)</Label>
                            <Input value={customer?.email || ''} onChange={e => setCustomer({...customer, email: e.target.value})} placeholder="email@example.com" />
                          </div>
                          
                          <div className="flex gap-3 pt-4">
                             <Button onClick={() => setIsNewCustomer(false)} variant="secondary" className="flex-1">إلغاء</Button>
                             <Button onClick={() => nextStep()} disabled={!customer?.name || !customer?.phone} className="flex-1">متابعة</Button>
                          </div>
                       </div>
                    )}
                 </div>
              )}
              
              {/* STEP 2: VEHICLE */}
              {step === 2 && (
                 <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-xl font-bold text-surface-900 border-b pb-2">بيانات المركبة</h3>
                    
                    {!isNewVehicle && customer?.vehicles && customer.vehicles.length > 0 ? (
                       <div className="space-y-4">
                          <p className="text-sm text-surface-600">اختر من مركبات العميل المسجلة:</p>
                          <div className="space-y-3">
                             {customer.vehicles.map(v => (
                                <div key={v.id} onClick={() => { setVehicle(v); setIsNewVehicle(false); nextStep(); }} className="p-4 border rounded-xl hover:border-primary-500 hover:bg-primary-50 cursor-pointer flex justify-between items-center transition-all">
                                   <div>
                                      <p className="font-bold text-surface-900">{v.vehicle_brand} {v.vehicle_type}</p>
                                      <div className="flex gap-2 text-sm text-surface-500 mt-1">
                                         <span className="bg-surface-200 px-2 rounded">{v.plate_number}</span>
                                         <span>اللون: {v.vehicle_color || 'غير محدد'}</span>
                                      </div>
                                   </div>
                                   <ChevronLeft className="text-primary-400" />
                                </div>
                             ))}
                          </div>
                          <Button onClick={() => { setIsNewVehicle(true); setVehicle({ vehicle_type: '', plate_number: '', vehicle_color: '' }); }} variant="outline" className="w-full h-12 border-dashed border-2 mt-4">
                            <Plus className="w-5 h-5 ml-2" /> إضافة مركبة جديدة
                          </Button>
                       </div>
                    ) : (
                       <div className="space-y-4 bg-surface-50 p-6 rounded-2xl border border-surface-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>نوع السيارة وموديلها *</Label>
                              <Input value={vehicle?.vehicle_type || ''} onChange={e => setVehicle({...vehicle, vehicle_type: e.target.value})} placeholder="مثال: تويوتا كامري" />
                            </div>
                            <div>
                              <Label>لون المركبة *</Label>
                              <Input value={vehicle?.vehicle_color || ''} onChange={e => setVehicle({...vehicle, vehicle_color: e.target.value})} placeholder="أسود، أبيض..." />
                            </div>
                            <div className="col-span-2">
                              <Label>رقم اللوحة *</Label>
                              <Input value={vehicle?.plate_number || ''} onChange={e => setVehicle({...vehicle, plate_number: e.target.value})} placeholder="أ ب ج 1234" className="text-center font-mono text-lg tracking-widest" />
                            </div>
                          </div>
                          
                          <div className="flex gap-3 pt-4">
                             {(!isNewCustomer && customer?.vehicles && customer.vehicles.length > 0) && (
                                <Button onClick={() => setIsNewVehicle(false)} variant="secondary" className="flex-1">رجوع للقائمة</Button>
                             )}
                             <Button onClick={() => nextStep()} disabled={!vehicle?.vehicle_type || !vehicle?.plate_number} className="flex-1">متابعة</Button>
                          </div>
                       </div>
                    )}
                 </div>
              )}
              
              {/* STEP 3: SERVICES */}
              {step === 3 && (
                 <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-xl font-bold text-surface-900 border-b pb-2">الخدمات المطلوبة</h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                       {availableProducts.map(srv => {
                         const isSelected = selectedServices.some(s => s.id === srv.id);
                         return (
                           <div key={srv.id} onClick={() => {
                              if (isSelected) {
                                 setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
                              } else {
                                 setSelectedServices([...selectedServices, srv]);
                              }
                           }} className={`p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary-50 border-primary-500 shadow-sm' : 'bg-surface-50 hover:border-primary-300'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold ${isSelected ? 'text-primary-900' : 'text-surface-800'}`}>{srv.name}</span>
                                {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                              </div>
                              <div className="text-lg font-black text-primary-700">{srv.price} ريال</div>
                           </div>
                         );
                       })}
                    </div>
                    
                    {selectedServices.length === 0 && (
                       <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" /> يرجى اختيار خدمة واحدة على الأقل.
                       </div>
                    )}
                 </div>
              )}
              
              {/* STEP 4: PRICING & PAYMENT */}
              {step === 4 && (
                 <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-xl font-bold text-surface-900 border-b pb-2">التسعير والدفع</h3>
                    
                    <div className="bg-surface-50 p-6 rounded-2xl border border-surface-200 space-y-6">
                       <div className="flex justify-between items-center text-lg">
                          <span className="text-surface-600">المجموع الفرعي:</span>
                          <span className="font-bold">{subtotal} ريال</span>
                       </div>
                       
                       <div className="flex justify-between items-center gap-4">
                          <Label className="whitespace-nowrap text-surface-600">الخصم:</Label>
                          <div className="relative w-1/3">
                            <Input type="number" min="0" max={subtotal} value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="pl-12 text-left" />
                            <span className="absolute left-4 top-3 text-surface-400 font-bold">SAR</span>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center gap-4 pt-4 border-t border-surface-200">
                          <span className="text-lg font-bold text-surface-900">الإجمالي بعد الخصم:</span>
                          <span className="text-2xl font-black text-primary-600">{totalAmount} ريال</span>
                       </div>
                       
                       <div className="flex justify-between items-center gap-4 pt-4 border-t border-surface-200">
                          <Label className="whitespace-nowrap font-bold text-surface-900">الدفعة المقدمة (عربون):</Label>
                          <div className="relative w-1/3">
                            <Input type="number" min="0" max={totalAmount} value={deposit || ''} onChange={e => setDeposit(Number(e.target.value))} className="pl-12 text-left" />
                            <span className="absolute left-4 top-3 text-surface-400 font-bold">SAR</span>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-200 mt-4">
                          <span className="font-bold text-primary-900">المتبقي للدفع:</span>
                          <span className="text-xl font-black text-primary-700">{remaining} ريال</span>
                       </div>
                    </div>
                 </div>
              )}
              
              {/* STEP 5: POLICY & WARRANTY */}
              {step === 5 && (
                 <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-xl font-bold text-surface-900 border-b pb-2">سياسة البيع والضمان</h3>
                    
                    <div className="bg-surface-50 p-6 rounded-2xl border border-surface-200">
                       <div className="text-sm text-surface-700 leading-relaxed whitespace-pre-wrap h-[30vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                          {settings?.service_policy || "لا توجد سياسة مسجلة. يرجى إضافتها من الإعدادات."}
                       </div>
                       
                       <label className="flex items-center gap-3 p-4 bg-white border border-primary-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" checked={policyAccepted} onChange={e => setPolicyAccepted(e.target.checked)} />
                          <span className="font-bold text-primary-900">أقر أنا العميل باطلاعي وموافقتي على شروط وسياسة الخدمة</span>
                       </label>
                    </div>
                 </div>
              )}
              
              {/* STEP 6: NOTES */}
              {step === 6 && (
                 <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-xl font-bold text-surface-900 border-b pb-2">الملاحظات وحالة المركبة</h3>
                    
                    <div className="space-y-4">
                       <Label>ملاحظات الاستلام (خدوش، طلبات خاصة، الخ)</Label>
                       <Textarea rows={6} value={notes} onChange={e => setNotes(e.target.value)} placeholder="سجل حالة السيارة من الخارج والداخل وأي متطلبات إضافية للعميل..." className="bg-surface-50" />
                    </div>
                 </div>
              )}
              
              {/* STEP 7: SUMMARY & SAVE */}
              {step === 7 && (
                 <div className="space-y-6 animate-in fade-in">
                    <h3 className="text-xl font-bold text-surface-900 border-b pb-2">مراجعة كرت العمل</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                          <p className="text-sm text-surface-500 mb-1">العميل</p>
                          <p className="font-bold text-surface-900">{customer?.name}</p>
                          <p className="text-sm text-surface-600 font-mono mt-1">{customer?.phone}</p>
                       </div>
                       <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                          <p className="text-sm text-surface-500 mb-1">المركبة</p>
                          <p className="font-bold text-surface-900">{vehicle?.vehicle_type}</p>
                          <p className="text-sm text-surface-600 mt-1">{vehicle?.plate_number} • {vehicle?.vehicle_color}</p>
                       </div>
                    </div>
                    
                    <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                       <p className="text-sm text-surface-500 mb-3">الخدمات ({selectedServices.length})</p>
                       <div className="space-y-2">
                          {selectedServices.map(s => (
                             <div key={s.id} className="flex justify-between text-sm font-medium">
                                <span>{s.name}</span>
                                <span>{s.price} ريال</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-200">
                       <div className="flex justify-between items-center font-bold mb-2 text-surface-700">
                          <span>الإجمالي:</span>
                          <span>{totalAmount} ريال</span>
                       </div>
                       <div className="flex justify-between items-center font-bold mb-2 text-surface-700">
                          <span>العربون المدفوع:</span>
                          <span className="text-emerald-600">{deposit} ريال</span>
                       </div>
                       <div className="flex justify-between items-center font-black text-lg pt-2 border-t border-primary-200 text-primary-900">
                          <span>المتبقي:</span>
                          <span>{remaining} ريال</span>
                       </div>
                    </div>
                 </div>
              )}
              
           </div>
           
           {/* Bottom Action Bar */}
           <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-surface-200 flex justify-between items-center gap-4">
              <Button onClick={prevStep} variant="secondary" disabled={step === 1} className="w-32">السابق</Button>
              
              {step < 7 ? (
                 <Button onClick={nextStep} className="flex-1 max-w-sm" disabled={
                    (step === 1 && !customer?.name) || 
                    (step === 2 && !vehicle?.vehicle_type) || 
                    (step === 3 && selectedServices.length === 0) ||
                    (step === 5 && !policyAccepted)
                 }>
                    التالي <ChevronLeft className="w-4 h-4 mr-2" />
                 </Button>
              ) : (
                 <Button onClick={handleSave} className="flex-1 max-w-sm h-12 text-lg font-bold bg-primary-600 hover:bg-primary-700">
                    حفظ وإنشاء الكرت
                 </Button>
              )}
           </div>
        </div>
      </div>
    </Modal>
  );
}
