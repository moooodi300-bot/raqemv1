const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// 1. Update RangeKey type
code = code.replace(/type RangeKey = 'thisMonth' \| 'last14' \| 'lastMonth' \| 'ytd' \| 'custom';/, 
  "type RangeKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'last3m' | 'thisYear' | 'custom';");

// 2. Update useMemo for ranges
const rangeTarget = `  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const now = new Date();
    if (range === 'thisMonth') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: d, endDate: now, rangeLabel: 'الشهر الحالي' };
    }
    if (range === 'last14') {
      const d = new Date(now);
      d.setDate(d.getDate() - 14);
      return { startDate: d, endDate: now, rangeLabel: 'آخر 14 يوم' };
    }
    if (range === 'lastMonth') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: d, endDate: e, rangeLabel: 'الشهر الماضي' };
    }
    if (range === 'ytd') {
      const d = new Date(now.getFullYear(), 0, 1);
      return { startDate: d, endDate: now, rangeLabel: 'منذ بداية العام' };
    }`;
const rangeReplacement = `  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (range === 'today') {
      return { startDate: startOfToday, endDate: now, rangeLabel: 'اليوم' };
    }
    if (range === 'yesterday') {
      const s = new Date(startOfToday); s.setDate(s.getDate() - 1);
      const e = new Date(startOfToday); e.setMilliseconds(-1);
      return { startDate: s, endDate: e, rangeLabel: 'الأمس' };
    }
    if (range === 'last7') {
      const s = new Date(startOfToday); s.setDate(s.getDate() - 7);
      return { startDate: s, endDate: now, rangeLabel: 'آخر 7 أيام' };
    }
    if (range === 'last30') {
      const s = new Date(startOfToday); s.setDate(s.getDate() - 30);
      return { startDate: s, endDate: now, rangeLabel: 'آخر 30 يوم' };
    }
    if (range === 'last3m') {
      const s = new Date(startOfToday); s.setMonth(s.getMonth() - 3);
      return { startDate: s, endDate: now, rangeLabel: 'آخر 3 أشهر' };
    }
    if (range === 'thisYear') {
      const s = new Date(now.getFullYear(), 0, 1);
      return { startDate: s, endDate: now, rangeLabel: 'هذا العام' };
    }`;
code = code.replace(rangeTarget, rangeReplacement);

// We need to rewrite a large part of DashboardPage, so maybe just overwrite the file or parts of it
fs.writeFileSync('src/pages/DashboardPage.tsx', code);
