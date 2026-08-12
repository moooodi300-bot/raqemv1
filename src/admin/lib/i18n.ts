export type Lang = 'en' | 'ar';

export const adminTranslations: Record<string, { en: string; ar: string }> = {
  // Navigation
  dashboard: { en: 'Dashboard', ar: 'لوحة القيادة' },
  businesses: { en: 'Businesses', ar: 'المنشآت' },
  subscriptions: { en: 'Subscriptions', ar: 'الاشتراكات' },
  customers: { en: 'Customers', ar: 'العملاء' },
  analytics: { en: 'Analytics', ar: 'التحليلات' },
  dataExport: { en: 'Data Export', ar: 'تصدير البيانات' },
  support: { en: 'Support', ar: 'الدعم' },
  maintenance: { en: 'Maintenance', ar: 'الصيانة' },
  plans: { en: 'Plans', ar: 'الباقات' },
  users: { en: 'Users', ar: 'المستخدمون' },
  auditLog: { en: 'Audit Log', ar: 'سجل العمليات' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },

  // Common
  save: { en: 'Save', ar: 'حفظ' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  search: { en: 'Search', ar: 'بحث' },
  filter: { en: 'Filter', ar: 'تصفية' },
  export: { en: 'Export', ar: 'تصدير' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  close: { en: 'Close', ar: 'إغلاق' },
  add: { en: 'Add', ar: 'إضافة' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  actions: { en: 'Actions', ar: 'إجراءات' },
  all: { en: 'All', ar: 'الكل' },
  today: { en: 'Today', ar: 'اليوم' },
  last7Days: { en: 'Last 7 Days', ar: 'آخر 7 أيام' },
  last30Days: { en: 'Last 30 Days', ar: 'آخر 30 يوم' },
  thisYear: { en: 'This Year', ar: 'هذا العام' },

  // Status
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  trial: { en: 'Trial', ar: 'تجريبي' },
  suspended: { en: 'Suspended', ar: 'موقوف' },
  expired: { en: 'Expired', ar: 'منتهي' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },

  // Dashboard
  totalBusinesses: { en: 'Total Businesses', ar: 'إجمالي المنشآت' },
  activeSubscriptions: { en: 'Active Subscriptions', ar: 'الاشتراكات النشطة' },
  mrr: { en: 'Monthly Recurring Revenue', ar: 'العوائد الشهرية المتكررة' },
  activeUsers: { en: 'Active Users', ar: 'المستخدمون النشطون' },
  platformCustomers: { en: 'Platform Customers', ar: 'عملاء المنصة' },
  platformSales: { en: 'Platform Sales', ar: 'مبيعات المنصة' },
  recentRegistrations: { en: 'Recent Registrations', ar: 'أحدث التسجيلات' },
  expiringSoon: { en: 'Expiring Soon', ar: 'قريبة من الانتهاء' },
  noExpiring: { en: 'No subscriptions expiring within 7 days.', ar: 'لا توجد اشتراكات تنتهي خلال 7 أيام.' },
  saasAdminPortal: { en: 'SaaS Admin Portal', ar: 'لوحة إدارة المنصة (SaaS)' },
  adminPassword: { en: 'Admin Password', ar: 'كلمة مرور الإدارة' },
  accessDashboard: { en: 'Access Dashboard', ar: 'دخول للوحة' },
  returnToApp: { en: 'Return to App', ar: 'العودة للتطبيق' },
  
  // Businesses
  businessId: { en: 'Business / ID', ar: 'المنشأة / المعرف' },
  plan: { en: 'Plan', ar: 'الباقة' },
  status: { en: 'Status', ar: 'الحالة' },
  dateRegistered: { en: 'Date Registered', ar: 'تاريخ التسجيل' },
  searchBusinesses: { en: 'Search businesses...', ar: 'ابحث عن منشأة...' },
  noBusinessesFound: { en: 'No businesses found.', ar: 'لم يتم العثور على منشآت.' },

  // Business Details
  revenue: { en: 'Revenue', ar: 'الإيرادات' },
  jobCards: { en: 'Job Cards', ar: 'كروت العمل' },
  subscriptionDetails: { en: 'Subscription Details', ar: 'تفاصيل الاشتراك' },
  renewPlan: { en: 'Renew Plan', ar: 'تجديد الباقة' },
  suspend: { en: 'Suspend', ar: 'إيقاف' },
  quickActions: { en: 'Quick Actions', ar: 'إجراءات سريعة' },
  viewUsers: { en: 'View Users', ar: 'عرض المستخدمين' },
  manageAdmins: { en: 'Manage tenant admins', ar: 'إدارة مدراء المنشأة' },
  activityLog: { en: 'Activity Log', ar: 'سجل النشاط' },
  viewAuditTrail: { en: 'View audit trail', ar: 'عرض سجل العمليات' },
  invoices: { en: 'Invoices', ar: 'الفواتير' },
  saasBillingHistory: { en: 'SaaS billing history', ar: 'تاريخ الفوترة' },
  loginAs: { en: 'Login As', ar: 'الدخول كـ' },
  accessWorkspace: { en: 'Access tenant workspace', ar: 'الدخول لمساحة المنشأة' },

  // Subscriptions
  platformSubscriptions: { en: 'Platform Subscriptions', ar: 'اشتراكات المنصة' },
  manage: { en: 'Manage', ar: 'إدارة' },

  // Support
  supportAndMaintenance: { en: 'Support & Maintenance', ar: 'الدعم والصيانة' },
  supportDesc: { en: 'Track support tickets, maintenance requests, and client communications across all platform tenants.', ar: 'تتبع تذاكر الدعم وطلبات الصيانة وتواصل العملاء عبر كافة المنشآت.' },
  recentTickets: { en: 'Recent Tickets', ar: 'أحدث التذاكر' },
  noTickets: { en: 'No support tickets found.', ar: 'لا توجد تذاكر دعم.' },

  // Plans
  subscriptionPlans: { en: 'Subscription Plans', ar: 'باقات الاشتراك' },
  createPlan: { en: 'Create Plan', ar: 'إنشاء باقة' },
  editPlan: { en: 'Edit Plan', ar: 'تعديل الباقة' },
  upToUsers: { en: 'Up to {n} Users', ar: 'حتى {n} مستخدمين' },
  upToCustomers: { en: 'Up to {n} Customers', ar: 'حتى {n} عميل' },
  unlimitedUsers: { en: 'Unlimited Users', ar: 'مستخدمين لامحدود' },
  unlimitedCustomers: { en: 'Unlimited Customers', ar: 'عملاء لامحدود' },
  standardAnalytics: { en: 'Standard Analytics', ar: 'تحليلات أساسية' },
  advancedAnalytics: { en: 'Advanced Analytics', ar: 'تحليلات متقدمة' },
  loyaltyWhatsapp: { en: 'Loyalty & WhatsApp', ar: 'الولاء وواتساب' },

  // Export
  exportConfiguration: { en: 'Export Configuration', ar: 'إعدادات التصدير' },
  business: { en: 'Business', ar: 'المنشأة' },
  allBusinesses: { en: 'All Businesses', ar: 'جميع المنشآت' },
  dataType: { en: 'Data Type', ar: 'نوع البيانات' },
  dateRange: { en: 'Date Range', ar: 'النطاق الزمني' },
  allTime: { en: 'All Time', ar: 'كل الأوقات' },
  exportPreview: { en: 'Export Preview', ar: 'معاينة التصدير' },
  recordsFound: { en: 'Records Found', ar: 'السجلات الموجودة' },
  exportExcel: { en: 'Export Excel', ar: 'تصدير Excel' },
  exportCSV: { en: 'Export CSV', ar: 'تصدير CSV' },
  exportPDF: { en: 'Export PDF', ar: 'تصدير PDF' },
  noRecordsToExport: { en: 'No records found to export', ar: 'لا توجد سجلات للتصدير' },
  pdfExportMsg: { en: 'PDF export logic to be implemented on server for large datasets.', ar: 'يتم تطبيق تصدير PDF عبر السيرفر للبيانات الكبيرة.' },
  anonymizedAnalytics: { en: 'Anonymized Analytics', ar: 'تحليلات مجهولة المصدر' },
  anonymizedDesc: { en: 'For large market studies, exporting Anonymized Data will strip personally identifiable information (PII) such as customer names and phone numbers, leaving only metrics and geographic information.', ar: 'للدراسات السوقية الكبيرة، سيقوم تصدير البيانات مجهولة المصدر بإزالة معلومات الهوية الشخصية (مثل أسماء العملاء وأرقامهم) وإبقاء الأرقام الإحصائية والمعلومات الجغرافية فقط.' },
  sales: { en: 'Sales', ar: 'المبيعات' },
};

export function tr(key: string, lang: Lang): string {
  if (!adminTranslations[key]) return key;
  return adminTranslations[key][lang] || key;
}
