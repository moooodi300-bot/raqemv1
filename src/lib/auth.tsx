import { supabase } from './supabase';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Role } from './rbac';
import type { Lang } from './i18n';
import type { Settings, Organization, Profile, SubscriptionPlan, Staff } from './types';
import { validatePassword } from './passwordValidator';
import { isValidEmail } from './emailValidator';

interface AuthState {
  session: Session | null;
  user: User | null;
  booting: boolean;
  isDemo: boolean;
  role: Role;
  staffName: string;
  activeEmployee: Staff | null;
  setActiveEmployee: (s: Staff | null) => void;
  lang: Lang;
  settings: Settings | null;
  organization: Organization | null;
  profile: Profile | null;
  plan: SubscriptionPlan | null;
  setRole: (r: Role) => void;
  setStaffName: (n: string) => void;
  setLang: (l: Lang) => void;
  setSettings: (s: Settings | null) => void;
  refreshSettings: () => Promise<void>;
  refreshOrg: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: any) => Promise<{ error: string | null; message?: string; autoSignedIn?: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateUserPassword: (newPassword: string) => Promise<{ error: string | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const DEFAULT_FALLBACK_SETTINGS: Settings = {
  id: 'default-settings-id',
  organization_id: 'default-org-id',
  company_name: 'مغسلة السيارات الذكية',
  vat_number: '310022334400003',
  cr_number: '1010889900',
  city: 'الرياض',
  district: 'حي الملقا',
  street: 'طريق الملك فهد',
  postal_code: '11564',
  building_number: '7412',
  vat_rate: 15,
  daily_volume_target: 30,
  working_days: 30,
  avg_service_price: 40,
  loyalty_target: 10,
  currency: 'SAR',
  language: 'ar',
  logo_url: null,
  phone: null,
  address: null,
  brand_color: '#0e7490',
  brand_accent: '#2563eb',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  whatsapp_in_progress: 'عميلنا العزيز، جاري العمل على مركبتك الآن.',
  whatsapp_completed: 'عميلنا العزيز، انتهينا من خدمة مركبتك.',
  whatsapp_delivered: 'عميلنا العزيز، شكراً لزيارتك، تم تسليم مركبتك.',
};

const AuthContext = createContext<AuthState | null>(null);

function generateId() {
  return Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [role, setRole] = useState<Role>('owner');
  const [staffName, setStaffName] = useState<string>('');
  const [activeEmployee, setActiveEmployee] = useState<Staff | null>(null);
  const [lang, setLang] = useState<Lang>('ar');
  const [settings, setSettingsState] = useState<Settings | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    // Listen for real Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supaSession) => {
      if (supaSession?.user) {
        setSession(supaSession);
        setUser(supaSession.user);
      }
    });

    const storedUser = localStorage.getItem('demo_auth_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        loadUserEnv(u);
      } catch (e) {
        setBooting(false);
      }
    } else {
      setBooting(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserEnv = (u: any) => {
    setUser(u as any);
    setSession({ user: u } as any);
    
    // Load Org
    const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
    let org = orgs.find((o: any) => o.id === u.tenant_id);
    
    if (!org) {
       org = {
         id: u.tenant_id || ('TENANT-' + generateId()),
         name: u.org_name || 'منشأتي التجارية',
         owner_id: u.id,
         subscription_status: 'active',
         created_at: new Date().toISOString(),
       };
    }

    setOrganization(org);
    setProfile({ id: u.id, organization_id: org.id, full_name: u.name || 'مدير المنشأة', role: 'owner' });
    setRole('owner');
    setStaffName(u.name || 'مدير المنشأة');

    const storedSettings = localStorage.getItem('raqm_app_settings_' + org.id);
    if (storedSettings) {
      setSettingsState(JSON.parse(storedSettings));
    } else {
      setSettingsState({ ...DEFAULT_FALLBACK_SETTINGS, company_name: org.name, organization_id: org.id });
    }

    setBooting(false);
  };

  const setSettings = (s: Settings | null) => {
    setSettingsState(s);
    if (s && organization) {
      localStorage.setItem('raqm_app_settings_' + organization.id, JSON.stringify(s));
    }
  };

  const refreshSettings = async () => {
    if (organization) {
      const stored = localStorage.getItem('raqm_app_settings_' + organization.id);
      if (stored) setSettingsState(JSON.parse(stored));
    }
  };

  const refreshOrg = async () => {};

  const initDemos = () => {
     const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
     
     // Remove plaintext passwords from legacy stored users
     const updatedUsers = users.map((u: any) => {
       const { password: _p, ...safeUser } = u; // strip plaintext password
       return safeUser;
     });
     
     if (!updatedUsers.find((u: any) => u.email === 'almanar@your-domain.com')) {
        const tenantId = 'TENANT-ALMANAR-0001';
        updatedUsers.push({ 
          id: 'almanar-owner-id', 
          name: 'مدير مغسلة المنار', 
          email: 'almanar@your-domain.com', 
          tenant_id: tenantId,
          role: 'business_owner'
        });
        localStorage.setItem('saas_users', JSON.stringify(updatedUsers));
        
        const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
        if (!orgs.find((o: any) => o.id === tenantId)) {
          orgs.push({ 
            id: tenantId, 
            name: 'مغسلة المنار', 
            owner_id: 'almanar-owner-id', 
            subscription_status: 'active',
            created_at: new Date().toISOString()
          });
          localStorage.setItem('saas_orgs', JSON.stringify(orgs));
        }
     } else {
        localStorage.setItem('saas_users', JSON.stringify(updatedUsers));
     }
  };

  const signIn = async (email: string, password: string) => {
    initDemos();
    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return { error: 'البريد الإلكتروني غير صحيح' };
    }

    // Try real Supabase authentication first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    
    if (error) {
      // Fallback to local demo users if Supabase auth fails (e.g. offline/mock environment)
      const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
      const localUser = users.find((u: any) => u.email.toLowerCase() === cleanEmail);
      
      if (localUser) {
        localStorage.setItem('demo_auth_user', JSON.stringify(localUser));
        loadUserEnv(localUser);
        return { error: null };
      }
      return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    if (data.user) {
      const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
      let userRecord = users.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (!userRecord) {
         const tenantId = 'TENANT-' + generateId();
         userRecord = {
           id: data.user.id,
           email: cleanEmail,
           name: data.user.user_metadata?.full_name || 'المستخدم',
           tenant_id: tenantId,
           role: 'business_owner'
         };
         users.push(userRecord);
         localStorage.setItem('saas_users', JSON.stringify(users));
         
         const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
         orgs.push({
           id: tenantId,
           name: 'منشأة جديدة',
           owner_id: data.user.id,
           subscription_status: 'active',
           created_at: new Date().toISOString()
         });
         localStorage.setItem('saas_orgs', JSON.stringify(orgs));
      }
      
      localStorage.setItem('demo_auth_user', JSON.stringify(userRecord));
      loadUserEnv(userRecord);
      return { error: null };
    }
    
    return { error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' };
  };

  const signUp = async (data: any) => {
    initDemos();
    
    const email = (data.email || '').trim().toLowerCase();
    const fullName = (data.fullName || '').trim();
    const orgName = (data.orgName || '').trim();
    const password = data.password || '';
    const passwordConfirm = data.passwordConfirm || data.confirmPassword || '';

    // 1. Email Validation
    if (!isValidEmail(email)) {
      return { error: 'البريد الإلكتروني غير صحيح' };
    }

    // 2. Check duplicate email in local records
    const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
    if (users.find((u: any) => u.email.toLowerCase() === email)) {
       return { error: 'البريد الإلكتروني مستخدم بالفعل' };
    }

    // 3. Password Requirements
    const passwordVal = validatePassword(password);
    if (!passwordVal.isValid) {
      return { error: 'كلمة المرور ضعيفة. يجب أن تحتوي على 9 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص' };
    }

    // 4. Password Confirmation Check
    if (password !== passwordConfirm) {
      return { error: 'كلمتا المرور غير متطابقتين' };
    }

    // 5. Create Tenant ID & Rollback protection
    const tenantId = 'TENANT-' + generateId();
    let authUserId = generateId();
    let isLocalFallback = false;

    // Save current state snapshot for rollback if needed
    const prevUsers = localStorage.getItem('saas_users');
    const prevOrgs = localStorage.getItem('saas_orgs');

    try {
      // Attempt Supabase auth registration
      const { data: supaData, error: supaError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            tenant_id: tenantId,
            org_name: orgName,
          }
        }
      });

      if (supaError) {
        if (supaError.message.toLowerCase().includes('already registered') || supaError.message.toLowerCase().includes('already exists')) {
          return { error: 'البريد الإلكتروني مستخدم بالفعل' };
        }
        console.warn('Supabase signup notice:', supaError.message);
        isLocalFallback = true;
      } else if (supaData?.user) {
        authUserId = supaData.user.id;
        if (supaData.user.identities && supaData.user.identities.length === 0) {
          return { error: 'البريد الإلكتروني مستخدم بالفعل' };
        }
      } else {
        isLocalFallback = true;
      }

      // Link User -> Tenant -> Business Data (WITHOUT storing plaintext password!)
      const newUserRecord = {
         id: authUserId,
         email: email,
         name: fullName,
         phone: data.userPhone || '',
         tenant_id: tenantId,
         role: 'business_owner',
         created_at: new Date().toISOString()
      };
      
      const newOrgRecord = {
         id: tenantId,
         name: orgName,
         cr_number: data.crNumber || '',
         city: data.city || 'الرياض',
         address: data.address || '',
         owner_id: authUserId,
         owner_name: fullName,
         owner_phone: data.userPhone || '',
         subscription_status: 'active',
         created_at: new Date().toISOString()
      };

      // Atomic commit to local state
      users.push(newUserRecord);
      localStorage.setItem('saas_users', JSON.stringify(users));
      
      const orgs = JSON.parse(localStorage.getItem('saas_orgs') || '[]');
      orgs.push(newOrgRecord);
      localStorage.setItem('saas_orgs', JSON.stringify(orgs));
      
      // Initialize default settings for new tenant
      localStorage.setItem('raqm_app_settings_' + tenantId, JSON.stringify({
         ...DEFAULT_FALLBACK_SETTINGS,
         company_name: orgName,
         organization_id: tenantId,
         cr_number: data.crNumber || '',
         city: data.city || 'الرياض',
         address: data.address || '',
         phone: data.userPhone || ''
      }));

      // Automatically sign in the new account
      localStorage.setItem('demo_auth_user', JSON.stringify(newUserRecord));
      loadUserEnv(newUserRecord);

      return { error: null, message: 'Account created successfully', autoSignedIn: true };

    } catch (err: any) {
      // Rollback on tenant creation or DB failure
      if (prevUsers !== null) localStorage.setItem('saas_users', prevUsers);
      if (prevOrgs !== null) localStorage.setItem('saas_orgs', prevOrgs);
      return { error: 'حدث خطأ أثناء إنشاء الحساب والمنشأة. تم إلغاء العملية.' };
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
       return { error: 'البريد الإلكتروني غير صحيح' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error && error.message === 'Failed to fetch') {
         return { error: 'غير قادر على الاتصال بالخادم. يرجى المحاولة لاحقاً.' };
      }
      return { error: error ? error.message : null };
    } catch {
      return { error: 'حدث خطأ غير متوقع أثناء إرسال رابط الاستعادة' };
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    const val = validatePassword(newPassword);
    if (!val.isValid) {
      return { error: 'كلمة المرور ضعيفة. يجب أن تحتوي على 9 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص' };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'حدث خطأ أثناء تحديث كلمة المرور' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('demo_auth_user');
    setSession(null);
    setUser(null);
    setOrganization(null);
    setProfile(null);
  };

  const value: AuthState = {
    session,
    user,
    booting,
    isDemo,
    role,
    staffName,
    activeEmployee,
    setActiveEmployee,
    lang,
    settings,
    organization,
    profile,
    plan,
    setRole,
    setStaffName,
    setLang,
    setSettings,
    refreshSettings,
    refreshOrg,
    signIn,
    signUp,
    resetPassword,
    updateUserPassword,
    resendConfirmationEmail: async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { error: error ? error.message : null };
    },
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { hasPermission as rbacHasPermission, type Permission } from './rbac';

export function usePermissions() {
  const { role, organization, activeEmployee } = useAuth();
  return {
    can: (perm: Permission) => rbacHasPermission(role, perm, organization?.id, activeEmployee?.permissions),
    role
  };
}
