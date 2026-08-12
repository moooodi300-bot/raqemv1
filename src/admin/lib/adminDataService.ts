import { supabase } from '@/lib/supabase';
import { getRegisteredTenants } from '@/lib/tenantManager';
import { getLocalCustomers, mergeCustomerLists } from '@/lib/customerStore';
import { getTenantCustomerSubscriptions, getTenantPackages } from '@/lib/subscriptionStore';

export interface AdminBusiness {
  id: string;
  name: string;
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  subscription_status: 'active' | 'suspended' | 'trial' | 'expired';
  plan_name: string;
  cr_number?: string;
  city?: string;
  address?: string;
  created_at: string;
  expiry_date?: string;
  customer_count?: number;
  total_revenue?: number;
  sales_count?: number;
  job_cards_count?: number;
}

export interface AdminActivityItem {
  id: string;
  type: 'sale' | 'customer' | 'job_card' | 'subscription' | 'purchase' | 'expense';
  tenant_id: string;
  tenant_name: string;
  title: string;
  details: string;
  amount?: number;
  date: string;
}

export interface PlatformStats {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  trialBusinesses: number;
  expiredBusinesses: number;
  totalCustomers: number;
  totalUsers: number;
  totalSalesCount: number;
  totalRevenue: number;
  mrr: number;
  activeSubscriptionsCount: number;
  expiringIn3Days: number;
  expiringIn7Days: number;
  expiringIn30Days: number;
  expiredSubscriptionsCount: number;
}

class AdminDataService {
  /**
   * Get all registered businesses across Supabase DB + Local Storage
   */
  async getBusinesses(): Promise<AdminBusiness[]> {
    const map = new Map<string, AdminBusiness>();

    // 1. Read from LocalStorage saas_orgs
    try {
      const rawOrgs = localStorage.getItem('saas_orgs');
      if (rawOrgs) {
        const orgs = JSON.parse(rawOrgs);
        if (Array.isArray(orgs)) {
          orgs.forEach((o: any) => {
            map.set(o.id, {
              id: o.id,
              name: o.name || 'منشأة بدون اسم',
              owner_id: o.owner_id,
              subscription_status: o.subscription_status || 'active',
              plan_name: o.plan_name || o.plan || 'Pro Plan',
              cr_number: o.cr_number || '',
              city: o.city || 'الرياض',
              address: o.address || '',
              created_at: o.created_at || new Date().toISOString(),
              expiry_date: o.expiry_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            });
          });
        }
      }
    } catch (e) {
      console.warn('Error reading saas_orgs:', e);
    }

    // 2. Read from tenantManager isolated tenants registry
    try {
      const regTenants = getRegisteredTenants();
      regTenants.forEach((t) => {
        if (!map.has(t.tenantId)) {
          map.set(t.tenantId, {
            id: t.tenantId,
            name: t.name,
            owner_email: t.ownerEmail,
            subscription_status: 'active',
            plan_name: 'Pro Plan',
            city: t.city,
            created_at: t.createdAt,
            expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          });
        }
      });
    } catch (e) {
      console.warn('Error reading registered tenants:', e);
    }

    // 3. Read from Supabase organizations table
    try {
      const { data: supaOrgs, error } = await supabase.from('organizations').select('*');
      if (!error && supaOrgs && supaOrgs.length > 0) {
        supaOrgs.forEach((o: any) => {
          const existing = map.get(o.id);
          map.set(o.id, {
            id: o.id,
            name: o.name || existing?.name || 'منشأة',
            owner_id: o.owner_id || existing?.owner_id,
            subscription_status: o.subscription_status || existing?.subscription_status || 'active',
            plan_name: o.plan_name || existing?.plan_name || 'Pro Plan',
            cr_number: o.cr_number || existing?.cr_number,
            city: o.city || existing?.city,
            address: o.address || existing?.address,
            created_at: o.created_at || existing?.created_at || new Date().toISOString(),
            expiry_date: o.expiry_date || existing?.expiry_date,
          });
        });
      }
    } catch (e) {
      // Ignore if Supabase table is unavailable
    }

    // Enhance owner details from saas_users / profiles
    const users = this.getAllUsers();
    const userMap = new Map<string, any>(users.map((u) => [u.tenant_id || u.id, u]));

    const list = Array.from(map.values()).map((b) => {
      const u = userMap.get(b.id) || users.find((usr) => usr.id === b.owner_id);
      return {
        ...b,
        owner_name: u?.name || b.owner_name || 'المالك',
        owner_email: u?.email || b.owner_email || '',
        owner_phone: u?.phone || b.owner_phone || '',
      };
    });

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get complete details & metrics for a specific business/tenant
   */
  async getBusinessDetails(tenantId: string): Promise<{
    business: AdminBusiness;
    customers: any[];
    sales: any[];
    jobCards: any[];
    purchases: any[];
    expenses: any[];
    products: any[];
    subscriptions: any[];
    staff: any[];
    stats: {
      totalRevenue: number;
      salesCount: number;
      customerCount: number;
      jobCardCount: number;
      purchaseCount: number;
      expenseCount: number;
    };
  }> {
    const businesses = await this.getBusinesses();
    let biz = businesses.find((b) => b.id === tenantId);

    if (!biz) {
      biz = {
        id: tenantId,
        name: `منشأة (${tenantId})`,
        subscription_status: 'active',
        plan_name: 'Pro Plan',
        created_at: new Date().toISOString(),
      };
    }

    const customers = this.getCustomers(tenantId);
    const sales = this.getSales(tenantId);
    const jobCards = this.getJobCards(tenantId);
    const purchases = this.getPurchases(tenantId);
    const expenses = this.getExpenses(tenantId);
    const products = this.getProducts(tenantId);
    const subscriptions = getTenantCustomerSubscriptions(tenantId);
    const staff = this.getStaff(tenantId);

    const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    return {
      business: {
        ...biz,
        customer_count: customers.length,
        sales_count: sales.length,
        total_revenue: totalRevenue,
        job_cards_count: jobCards.length,
      },
      customers,
      sales,
      jobCards,
      purchases,
      expenses,
      products,
      subscriptions,
      staff,
      stats: {
        totalRevenue,
        salesCount: sales.length,
        customerCount: customers.length,
        jobCardCount: jobCards.length,
        purchaseCount: purchases.length,
        expenseCount: expenses.length,
      },
    };
  }

  /**
   * Update subscription status or plan for a tenant
   * This updates the REAL database / store so the main application sees it immediately!
   */
  async updateBusinessSubscription(
    tenantId: string,
    updates: {
      subscription_status?: 'active' | 'suspended' | 'trial' | 'expired';
      plan_name?: string;
      expiry_date?: string;
    }
  ): Promise<boolean> {
    try {
      // 1. Update saas_orgs in LocalStorage
      const rawOrgs = localStorage.getItem('saas_orgs');
      let orgs: any[] = rawOrgs ? JSON.parse(rawOrgs) : [];
      let found = false;

      orgs = orgs.map((o) => {
        if (o.id === tenantId) {
          found = true;
          return {
            ...o,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return o;
      });

      if (!found) {
        orgs.push({
          id: tenantId,
          name: 'منشأة',
          ...updates,
          created_at: new Date().toISOString(),
        });
      }

      localStorage.setItem('saas_orgs', JSON.stringify(orgs));

      // 2. Update demo_auth_user if currently logged in user belongs to this tenant
      const rawDemoUser = localStorage.getItem('demo_auth_user');
      if (rawDemoUser) {
        try {
          const demoUser = JSON.parse(rawDemoUser);
          if (demoUser.tenant_id === tenantId) {
            demoUser.subscription_status = updates.subscription_status || demoUser.subscription_status;
            localStorage.setItem('demo_auth_user', JSON.stringify(demoUser));
          }
        } catch {}
      }

      // 3. Sync to Supabase organizations table if possible
      try {
        await supabase
          .from('organizations')
          .update({
            subscription_status: updates.subscription_status,
            plan_name: updates.plan_name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId);
      } catch (err) {
        // Ignore Supabase write errors
      }

      // Notify window of data update
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('raqam_data_updated'));

      return true;
    } catch (e) {
      console.error('Failed to update business subscription:', e);
      return false;
    }
  }

  /**
   * Fetch live customers for a specific tenant or ALL tenants
   */
  getCustomers(tenantId?: string): any[] {
    if (tenantId) {
      const local = mergeCustomerLists([], tenantId);
      return local;
    }

    // Aggregate across all businesses
    const businesses = this.getBusinessesSync();
    let allCusts: any[] = [];
    businesses.forEach((b) => {
      const custs = mergeCustomerLists([], b.id);
      allCusts = allCusts.concat(custs.map((c) => ({ ...c, tenant_id: b.id, tenant_name: b.name })));
    });
    return allCusts;
  }

  /**
   * Fetch live sales / invoices for a specific tenant or ALL tenants
   */
  getSales(tenantId?: string): any[] {
    if (tenantId) {
      try {
        const raw = localStorage.getItem(`tenant_sales_${tenantId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return [];
    }

    const businesses = this.getBusinessesSync();
    let allSales: any[] = [];
    businesses.forEach((b) => {
      try {
        const raw = localStorage.getItem(`tenant_sales_${b.id}`);
        if (raw) {
          const sales = JSON.parse(raw);
          if (Array.isArray(sales)) {
            allSales = allSales.concat(sales.map((s) => ({ ...s, tenant_id: b.id, tenant_name: b.name })));
          }
        }
      } catch {}
    });

    return allSales.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  }

  /**
   * Fetch live job cards for a specific tenant or ALL tenants
   */
  getJobCards(tenantId?: string): any[] {
    if (tenantId) {
      try {
        const raw = localStorage.getItem(`job_cards_${tenantId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return [];
    }

    const businesses = this.getBusinessesSync();
    let allJcs: any[] = [];
    businesses.forEach((b) => {
      try {
        const raw = localStorage.getItem(`job_cards_${b.id}`);
        if (raw) {
          const jcs = JSON.parse(raw);
          if (Array.isArray(jcs)) {
            allJcs = allJcs.concat(jcs.map((j) => ({ ...j, tenant_id: b.id, tenant_name: b.name })));
          }
        }
      } catch {}
    });
    return allJcs;
  }

  /**
   * Fetch live purchases for a specific tenant or ALL tenants
   */
  getPurchases(tenantId?: string): any[] {
    if (tenantId) {
      try {
        const raw = localStorage.getItem(`tenant_purchases_${tenantId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return [];
    }

    const businesses = this.getBusinessesSync();
    let allPurchases: any[] = [];
    businesses.forEach((b) => {
      try {
        const raw = localStorage.getItem(`tenant_purchases_${b.id}`);
        if (raw) {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            allPurchases = allPurchases.concat(items.map((i) => ({ ...i, tenant_id: b.id, tenant_name: b.name })));
          }
        }
      } catch {}
    });
    return allPurchases;
  }

  /**
   * Fetch live expenses for a specific tenant or ALL tenants
   */
  getExpenses(tenantId?: string): any[] {
    if (tenantId) {
      try {
        const raw = localStorage.getItem(`accounts_transactions_${tenantId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return [];
    }

    const businesses = this.getBusinessesSync();
    let allExpenses: any[] = [];
    businesses.forEach((b) => {
      try {
        const raw = localStorage.getItem(`accounts_transactions_${b.id}`);
        if (raw) {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            allExpenses = allExpenses.concat(items.map((i) => ({ ...i, tenant_id: b.id, tenant_name: b.name })));
          }
        }
      } catch {}
    });
    return allExpenses;
  }

  /**
   * Fetch live products & services for a tenant or ALL tenants
   */
  getProducts(tenantId?: string): any[] {
    if (tenantId) {
      try {
        const raw = localStorage.getItem(`raqam_products_v2_${tenantId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return [];
    }

    const businesses = this.getBusinessesSync();
    let allProducts: any[] = [];
    businesses.forEach((b) => {
      try {
        const raw = localStorage.getItem(`raqam_products_v2_${b.id}`);
        if (raw) {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            allProducts = allProducts.concat(items.map((i) => ({ ...i, tenant_id: b.id, tenant_name: b.name })));
          }
        }
      } catch {}
    });
    return allProducts;
  }

  /**
   * Fetch staff members for a tenant
   */
  getStaff(tenantId: string): any[] {
    try {
      const raw = localStorage.getItem(`tenant_staff_${tenantId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  /**
   * Get all registered users
   */
  getAllUsers(): any[] {
    try {
      const raw = localStorage.getItem('saas_users');
      if (raw) {
        const users = JSON.parse(raw);
        if (Array.isArray(users)) return users;
      }
    } catch {}
    return [];
  }

  /**
   * Synchronous helper to fetch businesses from LocalStorage
   */
  private getBusinessesSync(): AdminBusiness[] {
    const map = new Map<string, AdminBusiness>();
    try {
      const rawOrgs = localStorage.getItem('saas_orgs');
      if (rawOrgs) {
        const orgs = JSON.parse(rawOrgs);
        if (Array.isArray(orgs)) {
          orgs.forEach((o: any) => {
            map.set(o.id, {
              id: o.id,
              name: o.name || 'منشأة',
              subscription_status: o.subscription_status || 'active',
              plan_name: o.plan_name || o.plan || 'Pro Plan',
              created_at: o.created_at || new Date().toISOString(),
            });
          });
        }
      }
    } catch {}

    const regTenants = getRegisteredTenants();
    regTenants.forEach((t) => {
      if (!map.has(t.tenantId)) {
        map.set(t.tenantId, {
          id: t.tenantId,
          name: t.name,
          subscription_status: 'active',
          plan_name: 'Pro Plan',
          created_at: t.createdAt,
        });
      }
    });

    return Array.from(map.values());
  }

  /**
   * Get live platform-wide aggregated statistics
   */
  async getPlatformStatistics(): Promise<PlatformStats> {
    const businesses = await this.getBusinesses();
    const users = this.getAllUsers();
    const allCustomers = this.getCustomers();
    const allSales = this.getSales();

    const activeBusinesses = businesses.filter((b) => b.subscription_status === 'active').length;
    const suspendedBusinesses = businesses.filter((b) => b.subscription_status === 'suspended').length;
    const trialBusinesses = businesses.filter((b) => b.subscription_status === 'trial').length;
    const expiredBusinesses = businesses.filter((b) => b.subscription_status === 'expired').length;

    const totalRevenue = allSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    // Calculate customer subscriptions stats
    let totalActiveSubs = 0;
    let expiringIn3Days = 0;
    let expiringIn7Days = 0;
    let expiringIn30Days = 0;
    let expiredSubs = 0;

    const now = Date.now();
    businesses.forEach((b) => {
      const subs = getTenantCustomerSubscriptions(b.id);
      subs.forEach((s) => {
        if (s.status === 'active') totalActiveSubs++;
        if (s.status === 'expired') expiredSubs++;

        if (s.end_date) {
          const endDateMs = new Date(s.end_date).getTime();
          const diffDays = Math.ceil((endDateMs - now) / 86400000);
          if (diffDays >= 0 && diffDays <= 3) expiringIn3Days++;
          if (diffDays >= 0 && diffDays <= 7) expiringIn7Days++;
          if (diffDays >= 0 && diffDays <= 30) expiringIn30Days++;
        }
      });
    });

    const mrr = activeBusinesses * 299 + trialBusinesses * 149;

    return {
      totalBusinesses: businesses.length,
      activeBusinesses,
      suspendedBusinesses,
      trialBusinesses,
      expiredBusinesses,
      totalCustomers: allCustomers.length,
      totalUsers: users.length,
      totalSalesCount: allSales.length,
      totalRevenue,
      mrr,
      activeSubscriptionsCount: totalActiveSubs,
      expiringIn3Days,
      expiringIn7Days,
      expiringIn30Days,
      expiredSubscriptionsCount: expiredSubs,
    };
  }

  /**
   * Get real-time activity log aggregated across all businesses
   */
  getPlatformActivity(): AdminActivityItem[] {
    const activity: AdminActivityItem[] = [];
    const businesses = this.getBusinessesSync();
    
    // Add admin activity logs
    try {
      const adminAct = JSON.parse(localStorage.getItem('saas_admin_activity') || '[]');
      adminAct.forEach((a: any, i: number) => {
        activity.push({
          id: `act-admin-${i}-${a.date}`,
          type: 'customer', // generic icon
          tenant_id: 'admin',
          tenant_name: 'SaaS Platform',
          title: a.action,
          details: a.target + (a.details ? ` - ${a.details}` : ''),
          date: a.date
        });
      });
    } catch {}

    businesses.forEach((b) => {
      // Add sales activity
      const sales = this.getSales(b.id).slice(0, 5);
      sales.forEach((s) => {
        activity.push({
          id: `act-sale-${s.id}`,
          type: 'sale',
          tenant_id: b.id,
          tenant_name: b.name,
          title: `فاتورة مبيعات جديدة #${s.id}`,
          details: `عميل: ${s.customer?.name || 'زائر'} | طريقة الدفع: ${s.payment_method || 'نقدي'}`,
          amount: Number(s.total) || 0,
          date: s.created_at || s.date || new Date().toISOString(),
        });
      });

      // Add customer activity
      const customers = this.getCustomers(b.id).slice(0, 3);
      customers.forEach((c) => {
        activity.push({
          id: `act-cust-${c.id}`,
          type: 'customer',
          tenant_id: b.id,
          tenant_name: b.name,
          title: `تسجيل عميل جديد: ${c.name}`,
          details: `جوال: ${c.phone || '-'} | مركبة: ${c.vehicle_type || ''} (${c.plate_number || ''})`,
          date: c.created_at || new Date().toISOString(),
        });
      });

      // Add job card activity
      const jobCards = this.getJobCards(b.id).slice(0, 3);
      jobCards.forEach((j) => {
        activity.push({
          id: `act-jc-${j.id}`,
          type: 'job_card',
          tenant_id: b.id,
          tenant_name: b.name,
          title: `بطاقة عمل: ${j.serviceName || 'خدمة'}`,
          details: `لوحة: ${j.vehiclePlate || '-'} | الحالة: ${j.status || 'نشط'}`,
          amount: Number(j.price) || 0,
          date: j.createdAt || new Date().toISOString(),
        });
      });
    });

    return activity
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);
  }
}

export const adminDataService = new AdminDataService();
