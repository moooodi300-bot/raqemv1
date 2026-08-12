const fs = require('fs');
let code = fs.readFileSync('src/components/StaffSettings.tsx', 'utf8');

const targetStr = `        <div>
          <Label>رمز الدخول (PIN)</Label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute right-3 top-3 text-surface-400" />
            <Input 
              type="password" 
              placeholder={formData.id ? "اتركه فارغاً للاحتفاظ بالرمز الحالي" : "أدخل الرمز (4-6 أرقام)"} 
              className="pr-9 font-mono"
              disabled={!canManagePin}
              maxLength={6}
              value={formData.pin_code || ''} 
              onChange={e => setFormData({...formData, pin_code: e.target.value.replace(/\\D/g,'')})} 
            />
          </div>
        </div>

        <div>
          <Label>تأكيد الرمز (Confirm PIN)</Label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute right-3 top-3 text-surface-400" />
            <Input 
              type="password" 
              placeholder="تأكيد الرمز السري" 
              className="pr-9 font-mono"
              disabled={!canManagePin}
              maxLength={6}
              value={formData.confirm_pin || ''} 
              onChange={e => setFormData({...formData, confirm_pin: e.target.value.replace(/\\D/g,'')})} 
            />
          </div>
        </div>`;

const repStr = `        {canManagePin ? (
          <>
            <div>
              <Label>رمز الدخول (PIN)</Label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3 top-3 text-surface-400" />
                <Input 
                  type="password" 
                  placeholder={formData.id ? "اتركه فارغاً للاحتفاظ بالرمز الحالي" : "أدخل الرمز (4-6 أرقام)"} 
                  className="pr-9 font-mono"
                  maxLength={6}
                  value={formData.pin_code || ''} 
                  onChange={e => setFormData({...formData, pin_code: e.target.value.replace(/\\D/g,'')})} 
                />
              </div>
            </div>

            <div>
              <Label>تأكيد الرمز (Confirm PIN)</Label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3 top-3 text-surface-400" />
                <Input 
                  type="password" 
                  placeholder="تأكيد الرمز السري" 
                  className="pr-9 font-mono"
                  maxLength={6}
                  value={formData.confirm_pin || ''} 
                  onChange={e => setFormData({...formData, confirm_pin: e.target.value.replace(/\\D/g,'')})} 
                />
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-1 md:col-span-2 p-3 bg-surface-50 text-surface-500 rounded-lg text-sm border border-surface-200">
            ليس لديك صلاحية لتعديل الرمز السري.
          </div>
        )}`;

code = code.replace(targetStr, repStr);

fs.writeFileSync('src/components/StaffSettings.tsx', code);
