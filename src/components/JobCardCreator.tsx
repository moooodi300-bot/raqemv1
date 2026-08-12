import { useState, useEffect } from 'react';
import { Modal, Button, Input, Label, Textarea } from '@/components/ui';
import { Search, Plus, X, Camera, CheckCircle2, FileText, Settings, UserPlus, Car, Printer, MessageCircle } from 'lucide-react';
import type { Customer, CustomerVehicle, JobCard } from '@/lib/types';
import { saveLocalCustomer } from '@/lib/customerStore';

export function JobCardCreator({ 
    open, 
    onClose, 
    currentTenantId, 
    customers: initialCustomers,
    availableServices,
    settings,
    onJobCardCreated
}: {
    open: boolean,
    onClose: () => void,
    currentTenantId: string,
    customers: Customer[],
    availableServices: any[],
    settings: any,
    onJobCardCreated: (card: any, invoice: any, pdfReady: boolean) => void
}) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    
    // New Customer Form
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', notes: '', plate_number: '', vehicle_type: '', vehicle_color: '' });
    
    // Vehicle Selection
    const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);
    const [showNewVehicle, setShowNewVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ plate_number: '', vehicle_type: '', vehicle_color: '' });

    // Services
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    
    // Financials
    const [discount, setDiscount] = useState(0);
    const [deposit, setDeposit] = useState(0);
    
    // Notes
    const [notes, setNotes] = useState('');
    
    // Policy
    const [policyAccepted, setPolicyAccepted] = useState(false);

    // Success State
    const [createdCard, setCreatedCard] = useState<any | null>(null);

    useEffect(() => {
        setCustomers(initialCustomers);
    }, [initialCustomers]);

    const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const total = Math.max(0, subtotal - discount);
    const remaining = Math.max(0, total - deposit);

    const handleCreateCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) return;
        const exists = customers.find(c => c.phone === newCustomer.phone);
        if (exists) {
            // Check duplicates
            return;
        }

        const customerToAdd: Customer = {
            id: 'c-' + Date.now(),
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            notes: newCustomer.notes,
            plate_number: newCustomer.plate_number,
            vehicle_type: newCustomer.vehicle_type,
            vehicle_color: newCustomer.vehicle_color,
            vehicles: newCustomer.plate_number ? [{
                id: 'v-' + Date.now(),
                plate_number: newCustomer.plate_number,
                vehicle_type: newCustomer.vehicle_type,
                vehicle_color: newCustomer.vehicle_color,
            }] : [],
            loyalty_stamps: 0,
            free_washes_earned: 0,
            created_at: new Date().toISOString()
        };

        saveLocalCustomer(customerToAdd, currentTenantId);
        setCustomers([customerToAdd, ...customers]);
        setSelectedCustomer(customerToAdd);
        if (customerToAdd.vehicles && customerToAdd.vehicles.length > 0) {
            setSelectedVehicle(customerToAdd.vehicles[0]);
        }
        setShowNewCustomer(false);
    };

    const handleCreateJobCard = () => {
        if (!selectedCustomer) return;
        if (!selectedVehicle && !newCustomer.vehicle_type) return; 
        if (selectedServices.length === 0) return;
        if (!policyAccepted && settings?.service_policy) return;

        const jobCard = {
            id: 'JC-' + Math.floor(1000 + Math.random() * 9000),
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.name,
            phone: selectedCustomer.phone || '',
            carType: selectedVehicle ? selectedVehicle.vehicle_type : '',
            plate: selectedVehicle ? selectedVehicle.plate_number : '',
            carColor: selectedVehicle ? selectedVehicle.vehicle_color : '',
            mileage: '', 
            notes: notes,
            status: 'in_progress',
            photosCount: 0,
            services: selectedServices,
            totalAmount: total,
            deposit: deposit,
            discount: discount,
            remaining: remaining,
            policy_text: settings?.service_policy || '',
            policy_accepted: policyAccepted,
            createdAt: new Date().toISOString()
        };

        setCreatedCard(jobCard);
        onJobCardCreated(jobCard, null, true);
    };

    const handleGeneratePDF = async (card: any) => {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            doc.setFontSize(22);
            doc.text(settings?.company_name || 'Raqam POS', 105, 20, { align: 'center' });
            
            doc.setFontSize(14);
            doc.text(`JOB CARD #${card.id}`, 105, 30, { align: 'center' });
            
            doc.setFontSize(12);
            let y = 45;
            
            // Customer Info
            doc.setFontSize(14);
            doc.text('Customer Information', 20, y);
            doc.setFontSize(11);
            doc.text(`Name: ${card.customerName}`, 20, y+8);
            doc.text(`Phone: ${card.phone}`, 20, y+14);
            
            // Vehicle Info
            doc.setFontSize(14);
            doc.text('Vehicle Information', 120, y);
            doc.setFontSize(11);
            doc.text(`Vehicle: ${card.carType}`, 120, y+8);
            doc.text(`Color: ${card.carColor || '-'}`, 120, y+14);
            doc.text(`Plate: ${card.plate || '-'}`, 120, y+20);
            
            y += 35;
            
            // Services
            doc.setFontSize(14);
            doc.text('Services', 20, y);
            doc.setFontSize(11);
            y += 8;
            card.services.forEach((s: any) => {
               doc.text(`- ${s.name}`, 20, y);
               doc.text(`${s.price} SAR`, 170, y, { align: 'right' });
               y += 8;
            });
            
            // Payment
            y += 5;
            doc.setFontSize(14);
            doc.text('Payment Summary', 20, y);
            doc.setFontSize(11);
            y += 8;
            doc.text(`Subtotal: ${subtotal} SAR`, 20, y); y += 6;
            if(discount > 0) { doc.text(`Discount: ${discount} SAR`, 20, y); y += 6; }
            if(deposit > 0) { doc.text(`Deposit: ${deposit} SAR`, 20, y); y += 6; }
            doc.text(`Remaining: ${remaining} SAR`, 20, y); y += 6;
            doc.setFontSize(12);
            doc.text(`Total: ${card.totalAmount} SAR`, 20, y+2); y += 15;
            
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
                doc.text(`[ X ] I have read and accept the service policy.`, 20, y+8);
                doc.text(`Date: ${new Date(card.createdAt).toLocaleString('en-US')}`, 20, y+14);
                doc.text(`Staff: Owner`, 20, y+20);
            }
            
            doc.save(`JobCard_${card.id}.pdf`);
        } catch(e) {
            console.error('PDF generation failed', e);
        }
    };

    const handleWhatsApp = (card: any) => {
        handleGeneratePDF(card);
        const msg = `Hello ${card.customerName},

Your Job Card #${card.id} has been created successfully.
The Job Card includes the vehicle details, services, payment information, and Service Policy & Warranty.

Total: ${card.totalAmount} SAR
Remaining: ${card.remaining} SAR

Thank you.`;
        const url = `https://wa.me/${card.phone.replace(/^0/, '966')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    if (createdCard) {
        return (
            <Modal open={open} onClose={() => { onClose(); setCreatedCard(null); }} title="" size="sm">
                <div className="text-center py-6 space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-black text-surface-900">تم إنشاء كرت العمل بنجاح</h2>
                    <p className="text-surface-500">تم حفظ بيانات الكرت ورقم الكرت هو <span className="font-bold text-surface-800">#{createdCard.id}</span></p>
                    
                    <div className="grid grid-cols-1 gap-3 pt-4">
                        <Button onClick={() => handleGeneratePDF(createdCard)} variant="outline" className="h-12 border-surface-200 text-surface-700">
                            <Printer className="w-5 h-5 ml-2" /> عرض / طباعة PDF
                        </Button>
                        <Button onClick={() => handleWhatsApp(createdCard)} className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                            <MessageCircle className="w-5 h-5 ml-2" /> إرسال عبر الواتساب
                        </Button>
                        <Button onClick={() => { onClose(); setCreatedCard(null); }} variant="ghost" className="h-12 text-surface-500">
                            إغلاق
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={onClose} title="إنشاء كرت عمل جديد" size="xl">
            <div className="space-y-6 bg-surface-50 p-2 md:p-6 rounded-2xl">
                {/* Customer Section */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200">
                    <h3 className="text-lg font-black text-surface-900 mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary-600" /> 1. بيانات العميل
                    </h3>
                    {!selectedCustomer ? (
                        <div className="space-y-4">
                            {!showNewCustomer ? (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
                                        <Input 
                                            placeholder="ابحث برقم الجوال أو اسم العميل..." 
                                            value={customerSearch} 
                                            onChange={e => setCustomerSearch(e.target.value)}
                                            className="pr-10"
                                        />
                                        {customerSearch && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-surface-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                                {customers.filter(c => c.name.includes(customerSearch) || (c.phone || '').includes(customerSearch)).map(c => (
                                                    <div key={c.id} onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setCustomerSearch('');
                                                        if (c.vehicles && c.vehicles.length > 0) {
                                                            setSelectedVehicle(c.vehicles[0]);
                                                        }
                                                    }} className="p-3 hover:bg-surface-50 cursor-pointer border-b last:border-0 border-surface-100 transition-colors">
                                                        <div className="font-bold text-surface-900">{c.name}</div>
                                                        <div className="text-sm text-surface-500 font-mono">{c.phone}</div>
                                                    </div>
                                                ))}
                                                {customers.filter(c => c.name.includes(customerSearch) || (c.phone || '').includes(customerSearch)).length === 0 && (
                                                    <div className="p-4 text-center text-surface-500">لا يوجد عميل مطابق.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button onClick={() => setShowNewCustomer(true)} className="bg-primary-600 shrink-0">
                                        <Plus className="w-4 h-4 ml-2" /> عميل جديد
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-surface-800">إضافة عميل جديد</h4>
                                        <Button variant="ghost" onClick={() => setShowNewCustomer(false)}><X className="w-4 h-4" /></Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><Label>اسم العميل *</Label><Input value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} /></div>
                                        <div><Label>رقم الجوال *</Label><Input value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} /></div>
                                        <div><Label>نوع السيارة</Label><Input value={newCustomer.vehicle_type} onChange={e => setNewCustomer({...newCustomer, vehicle_type: e.target.value})} /></div>
                                        <div><Label>رقم اللوحة</Label><Input value={newCustomer.plate_number} onChange={e => setNewCustomer({...newCustomer, plate_number: e.target.value})} /></div>
                                        <div><Label>لون السيارة</Label><Input value={newCustomer.vehicle_color} onChange={e => setNewCustomer({...newCustomer, vehicle_color: e.target.value})} /></div>
                                    </div>
                                    <Button onClick={handleCreateCustomer} disabled={!newCustomer.name || !newCustomer.phone} className="w-full">حفظ وإضافة العميل</Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-primary-50 p-4 rounded-xl border border-primary-100">
                            <div>
                                <div className="font-black text-primary-900 text-lg">{selectedCustomer.name}</div>
                                <div className="text-primary-700 font-mono mt-1">{selectedCustomer.phone}</div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedCustomer(null); setSelectedVehicle(null); }} className="text-rose-600 border-rose-200 hover:bg-rose-50">تغيير العميل</Button>
                        </div>
                    )}
                </div>

                {/* Vehicle Section */}
                {selectedCustomer && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200">
                        <h3 className="text-lg font-black text-surface-900 mb-4 flex items-center gap-2">
                            <Car className="w-5 h-5 text-primary-600" /> 2. بيانات المركبة
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {selectedCustomer.vehicles?.map(v => (
                                <div key={v.id} onClick={() => setSelectedVehicle(v)} className={`p-3 rounded-xl border cursor-pointer transition-colors ${selectedVehicle?.id === v.id ? 'bg-primary-50 border-primary-400 ring-2 ring-primary-100' : 'bg-surface-50 border-surface-200 hover:border-primary-300'}`}>
                                    <div className="font-bold text-surface-900">{v.vehicle_type || 'مركبة'}</div>
                                    <div className="text-sm text-surface-500 mt-1">{v.plate_number}</div>
                                    {v.vehicle_color && <div className="text-xs text-surface-400 mt-1">اللون: {v.vehicle_color}</div>}
                                </div>
                            ))}
                            <div onClick={() => setShowNewVehicle(true)} className="p-3 rounded-xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center text-surface-500 cursor-pointer hover:border-primary-400 hover:text-primary-600 bg-surface-50 transition-colors">
                                <Plus className="w-6 h-6 mb-1" />
                                <span className="text-sm font-bold">إضافة مركبة</span>
                            </div>
                        </div>

                        {showNewVehicle && (
                            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 space-y-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-surface-800">إضافة مركبة للعميل</h4>
                                    <Button variant="ghost" onClick={() => setShowNewVehicle(false)}><X className="w-4 h-4" /></Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><Label>نوع السيارة وموديلها *</Label><Input value={newVehicle.vehicle_type} onChange={e => setNewVehicle({...newVehicle, vehicle_type: e.target.value})} /></div>
                                    <div><Label>رقم اللوحة</Label><Input value={newVehicle.plate_number} onChange={e => setNewVehicle({...newVehicle, plate_number: e.target.value})} /></div>
                                    <div><Label>لون السيارة</Label><Input value={newVehicle.vehicle_color} onChange={e => setNewVehicle({...newVehicle, vehicle_color: e.target.value})} /></div>
                                </div>
                                <Button onClick={() => {
                                    if(!newVehicle.vehicle_type) return;
                                    const vehicle: CustomerVehicle = { id: 'v-' + Date.now(), ...newVehicle };
                                    const updatedCustomer = { ...selectedCustomer, vehicles: [...(selectedCustomer.vehicles || []), vehicle] };
                                    setSelectedCustomer(updatedCustomer);
                                    const updatedCustomers = customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
                                    setCustomers(updatedCustomers);
                                    saveLocalCustomer(updatedCustomer, currentTenantId);
                                    setSelectedVehicle(vehicle);
                                    setShowNewVehicle(false);
                                    setNewVehicle({ plate_number: '', vehicle_type: '', vehicle_color: '' });
                                }} disabled={!newVehicle.vehicle_type}>حفظ المركبة</Button>
                            </div>
                        )}
                        
                        {selectedVehicle && (
                            <div className="flex flex-wrap items-center gap-4 text-sm bg-surface-50 p-3 rounded-lg border border-surface-200">
                                <div><span className="text-surface-500">المركبة المحددة:</span> <span className="font-bold text-surface-900">{selectedVehicle.vehicle_type}</span></div>
                                <div><span className="text-surface-500">اللوحة:</span> <span className="font-bold text-surface-900">{selectedVehicle.plate_number}</span></div>
                                <div><span className="text-surface-500">اللون:</span> <span className="font-bold text-surface-900">{selectedVehicle.vehicle_color || '-'}</span></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Services Section */}
                {selectedVehicle && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200">
                        <h3 className="text-lg font-black text-surface-900 mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary-600" /> 3. الخدمات المطلوبة
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableServices.map(srv => {
                                const isSelected = selectedServices.find(s => s.id === srv.id);
                                return (
                                    <div key={srv.id} onClick={() => {
                                        if (isSelected) {
                                            setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
                                        } else {
                                            setSelectedServices([...selectedServices, { ...srv }]);
                                        }
                                    }} className={`p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 border-primary-500 shadow-sm' : 'bg-surface-50 border-surface-200 hover:border-primary-300'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`font-bold leading-tight ${isSelected ? 'text-primary-900' : 'text-surface-800'}`}>{srv.name}</span>
                                            {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />}
                                        </div>
                                        <div className="text-primary-700 font-black mt-2">{srv.price} ريال</div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Custom Service */}
                        <div className="mt-4 p-4 bg-surface-50 rounded-xl border border-surface-200 flex flex-wrap md:flex-nowrap gap-2 items-end">
                            <div className="flex-1 w-full">
                                <Label>خدمة يدوية إضافية</Label>
                                <Input id="custom_srv_name" placeholder="وصف الخدمة" />
                            </div>
                            <div className="w-full md:w-32">
                                <Label>السعر</Label>
                                <Input id="custom_srv_price" type="number" placeholder="0" />
                            </div>
                            <Button variant="outline" className="bg-white w-full md:w-auto" onClick={() => {
                                const nameInput = document.getElementById('custom_srv_name') as HTMLInputElement;
                                const priceInput = document.getElementById('custom_srv_price') as HTMLInputElement;
                                if (nameInput.value && priceInput.value) {
                                    setSelectedServices([...selectedServices, { id: 'c-' + Date.now(), name: nameInput.value, price: Number(priceInput.value) }]);
                                    nameInput.value = '';
                                    priceInput.value = '';
                                }
                            }}>إضافة</Button>
                        </div>
                    </div>
                )}

                {/* Pricing & Payment */}
                {selectedServices.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200">
                        <h3 className="text-lg font-black text-surface-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-600" /> 4. الدفع والحساب
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-surface-600 p-2 bg-surface-50 rounded-lg">
                                    <span className="font-bold">الإجمالي الفرعي:</span> 
                                    <span className="font-mono font-bold text-surface-900">{subtotal} ريال</span>
                                </div>
                                <div className="flex justify-between items-center p-2">
                                    <span className="text-surface-600 font-bold">الخصم (ريال):</span> 
                                    <Input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} className="w-32 h-10 text-left font-mono font-bold" />
                                </div>
                                <div className="flex justify-between items-center p-2">
                                    <span className="text-surface-600 font-bold">عربون مقدم (ريال):</span> 
                                    <Input type="number" value={deposit || ''} onChange={e => setDeposit(Number(e.target.value))} className="w-32 h-10 text-left font-mono font-bold" />
                                </div>
                            </div>
                            <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 flex flex-col justify-center space-y-4">
                                <div className="flex justify-between items-center text-lg border-b border-primary-200 pb-3">
                                    <span className="font-bold text-surface-700">المبلغ الإجمالي (بعد الخصم):</span>
                                    <span className="font-black text-surface-900 text-2xl font-mono">{total} ريال</span>
                                </div>
                                <div className="flex justify-between items-center text-lg pt-1">
                                    <span className="font-bold text-surface-700">المتبقي للدفع:</span>
                                    <span className="font-black text-primary-700 text-2xl font-mono">{remaining} ريال</span>
                                </div>
                                <div className="text-center text-sm font-bold mt-4 p-2 bg-white rounded-lg shadow-sm border border-surface-100">
                                    حالة الدفع: <span className={remaining === 0 ? "text-emerald-600" : (deposit > 0 ? "text-amber-600" : "text-rose-600")}>{remaining === 0 ? 'مدفوع بالكامل' : (deposit > 0 ? 'مدفوع جزئياً (عربون)' : 'غير مدفوع')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Policy & Notes */}
                {selectedServices.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200 flex flex-col">
                            <h3 className="text-lg font-black text-surface-900 mb-4">5. ملاحظات الكرت</h3>
                            <Textarea rows={6} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات حول حالة السيارة، ممتلكات العميل، أو تعليمات خاصة..." className="flex-1" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200 flex flex-col">
                            <h3 className="text-lg font-black text-surface-900 mb-4">6. سياسة العمل والضمان</h3>
                            <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 text-sm text-surface-700 h-48 overflow-y-auto mb-4 whitespace-pre-wrap leading-relaxed shadow-inner">
                                {settings?.service_policy || 'لا توجد سياسة عمل مضافة في الإعدادات.'}
                            </div>
                            <label className="flex items-start gap-3 cursor-pointer mt-auto bg-primary-50 p-4 rounded-xl border border-primary-100 hover:bg-primary-100 transition-colors shadow-sm">
                                <input type="checkbox" checked={policyAccepted} onChange={e => setPolicyAccepted(e.target.checked)} className="mt-1 w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500" />
                                <span className="text-sm font-bold text-primary-900 leading-snug">
                                    أقر بأن العميل قد اطلع ووافق على سياسة العمل والضمان المذكورة أعلاه.
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Save Action */}
                {selectedServices.length > 0 && (
                    <div className="pt-6">
                        <Button 
                            onClick={handleCreateJobCard} 
                            disabled={!policyAccepted && !!settings?.service_policy} 
                            className="w-full h-16 text-xl font-black shadow-xl shadow-primary-900/20 rounded-2xl"
                        >
                            <CheckCircle2 className="w-6 h-6 ml-2" />
                            حفظ وإنشاء كرت العمل
                        </Button>
                        {!policyAccepted && !!settings?.service_policy && (
                            <p className="text-center text-rose-500 text-sm mt-3 font-bold bg-rose-50 p-2 rounded-lg">يرجى تأكيد موافقة العميل على سياسة العمل لإنشاء الكرت</p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
