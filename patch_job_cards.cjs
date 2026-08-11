const fs = require('fs');

let code = fs.readFileSync('src/pages/JobCardsPage.tsx', 'utf8');

// 1. In Settings, add "Service Policy" under SettingsPage (I'll do that next).
// 2. In JobCard type, add policy_text?: string; and policy_accepted?: boolean;
code = code.replace(/interface JobCard \{/g, "interface JobCard {\n  policy_text?: string;\n  policy_accepted?: boolean;");

// 3. When creating a Job Card, fetch the policy from settings and save it.
const newCardTarget = `const newCard: JobCard = {
      id: \`jc-\${Date.now()}\`,
      customerName: newForm.customerName,
      phone: newForm.phone,`;
const newCardReplacement = `
    const defaultPolicy = "تعتبر العربون غير مسترد.\\nالمحل غير مسؤول عن الأضرار السابقة، العيوب، العيوب الخفية، أو المشاكل التي لم يتم الإفصاح عنها أو توثيقها قبل الخدمة.\\nالعميل مسؤول عن إزالة الممتلكات الشخصية والأشياء الثمينة من المركبة قبل تسليمها.\\nيوافق العميل على فحص المركبة والعمل المنجز عند التسليم.\\nبالنسبة للتظليل، التلميع، الحماية، العناية بالسيارات وغيرها من خدمات العناية بالمركبة، قد تختلف النتائج حسب حالة المركبة، عمرها، الإصلاحات السابقة، حالة الطلاء، المواد، والأضرار الموجودة.\\nأي ضمان للخدمة يطبق فقط وفقاً للشروط المحددة المتفق عليها للخدمة.\\nبموافقة العميل على كرت العمل، يؤكد أنه قرأ وقبل هذه الشروط.";
    const currentPolicy = (settings as any)?.service_policy || defaultPolicy;

    const newCard: JobCard = {
      id: \`jc-\${Date.now()}\`,
      customerName: newForm.customerName,
      phone: newForm.phone,
      policy_text: currentPolicy,
      policy_accepted: true,
`;
code = code.replace(newCardTarget, newCardReplacement);

// 4. In the Add Job Card form, add the checkbox for acceptance.
const formCheckboxTarget = `<div><Label>{tr('notes', lang)}</Label><Input value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} /></div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddCard} className="w-full">
              <Plus className="w-4 h-4 ml-2" /> {tr('addJobCard', lang)}
            </Button>`;
const formCheckboxReplacement = `<div><Label>{tr('notes', lang)}</Label><Input value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} /></div>
            
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 mt-4">
               <h4 className="font-bold text-surface-800 text-sm mb-2">سياسة الخدمة</h4>
               <div className="text-xs text-surface-600 max-h-32 overflow-y-auto whitespace-pre-line mb-3">
                  {(settings as any)?.service_policy || "تعتبر العربون غير مسترد.\\nالمحل غير مسؤول عن الأضرار السابقة، العيوب، العيوب الخفية، أو المشاكل التي لم يتم الإفصاح عنها أو توثيقها قبل الخدمة.\\nالعميل مسؤول عن إزالة الممتلكات الشخصية والأشياء الثمينة من المركبة قبل تسليمها.\\nيوافق العميل على فحص المركبة والعمل المنجز عند التسليم.\\nبالنسبة للتظليل، التلميع، الحماية، العناية بالسيارات وغيرها من خدمات العناية بالمركبة، قد تختلف النتائج حسب حالة المركبة، عمرها، الإصلاحات السابقة، حالة الطلاء، المواد، والأضرار الموجودة.\\nأي ضمان للخدمة يطبق فقط وفقاً للشروط المحددة المتفق عليها للخدمة.\\nبموافقة العميل على كرت العمل، يؤكد أنه قرأ وقبل هذه الشروط."}
               </div>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" id="accept_policy" className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4" />
                 <span className="text-sm font-bold text-surface-800">لقد قرأت وأوافق على سياسة الخدمة</span>
               </label>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={() => {
              if(!(document.getElementById('accept_policy') as HTMLInputElement).checked) {
                alert('يجب الموافقة على سياسة الخدمة أولاً');
                return;
              }
              handleAddCard();
            }} className="w-full">
              <Plus className="w-4 h-4 ml-2" /> {tr('addJobCard', lang)}
            </Button>`;
code = code.replace(formCheckboxTarget, formCheckboxReplacement);

// 5. In the Job Card PDF/Print out, display the policy.
const printPolicyTarget = `         </div>

          <div class="footer">`;
const printPolicyReplacement = `         </div>

          \${card.policy_text ? \`
          <div style="margin-top:20px; padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            <h4 style="margin:0 0 10px 0; color:#1e293b; font-size:12px;">سياسة الخدمة (Service Policy)</h4>
            <div style="font-size:10px; color:#475569; white-space:pre-line; line-height:1.5;">\${card.policy_text}</div>
            <div style="margin-top:15px; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:10px;">
              <span style="font-size:10px; font-weight:bold; color:#0f172a;">موافقة العميل (Customer Acceptance)</span>
              <span style="font-size:10px;">\${card.policy_accepted ? '✅ موافق (Accepted)' : '_________________'}</span>
            </div>
          </div>
          \` : ''}

          <div class="footer">`;
code = code.replace(printPolicyTarget, printPolicyReplacement);


fs.writeFileSync('src/pages/JobCardsPage.tsx', code);
