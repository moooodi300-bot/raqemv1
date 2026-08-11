const fs = require('fs');
let code = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');

const target = `<div>
                    <Label>الهدف اليومي لعدد السيارات</Label>
                    <Input type="number" value={facility.daily_volume_target || ''} onChange={e => setFacility({...facility, daily_volume_target: Number(e.target.value)})} />
                  </div>`;
const replacement = `<div>
                    <Label>الهدف اليومي لعدد السيارات</Label>
                    <Input type="number" value={facility.daily_volume_target || ''} onChange={e => setFacility({...facility, daily_volume_target: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>الهدف المالي الشهري (المبيعات)</Label>
                    <Input type="number" value={(facility as any).sales_target_monthly || ''} onChange={e => setFacility({...facility, sales_target_monthly: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>الهدف المالي اليومي (المبيعات)</Label>
                    <Input type="number" value={(facility as any).sales_target_daily || ''} onChange={e => setFacility({...facility, sales_target_daily: Number(e.target.value)})} />
                  </div>`;
code = code.replace(target, replacement);
fs.writeFileSync('src/pages/SettingsPage.tsx', code);
