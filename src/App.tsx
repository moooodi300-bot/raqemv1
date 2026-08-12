import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import { canAccess, type ModuleKey } from '@/lib/rbac';
import { generateMockData } from '@/lib/mockDataGenerator';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { Card, CardBody, Spinner } from '@/components/ui';
import { ShieldAlert } from 'lucide-react';
import { tr } from '@/lib/i18n';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PinEntryScreen } from '@/components/PinEntryScreen';
import type { Staff } from '@/lib/types';

import React, { Suspense } from 'react';
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const SalesPage = React.lazy(() => import('@/pages/SalesPage').then(module => ({ default: module.SalesPage })));
const InvoicesPage = React.lazy(() => import('@/pages/InvoicesPage').then(module => ({ default: module.InvoicesPage })));
const CustomersPage = React.lazy(() => import('@/pages/CustomersPage').then(module => ({ default: module.CustomersPage })));
const PurchasesPage = React.lazy(() => import('@/pages/PurchasesPage').then(module => ({ default: module.PurchasesPage })));
const JobCardsPage = React.lazy(() => import('@/pages/JobCardsPage').then(module => ({ default: module.JobCardsPage })));
const ReportsPage = React.lazy(() => import('@/pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const MobilePage = React.lazy(() => import('@/pages/MobilePage').then(module => ({ default: module.MobilePage })));
const BillingPage = React.lazy(() => import('@/pages/BillingPage').then(module => ({ default: module.BillingPage })));

function AppContent() {
  const { role, lang, organization, activeEmployee } = useAuth();
  const [active, setActive] = useState<ModuleKey>('dashboard');
  const handleNav = (key: ModuleKey) => {
    React.startTransition(() => {
      setActive(key);
    });
  };

  const effectiveKey = canAccess(role, active, organization?.id, activeEmployee?.permissions) ? active : 'dashboard';

  const renderPage = () => {
    switch (effectiveKey) {
      case 'dashboard': return <DashboardPage />;
      case 'sales': return <SalesPage />;
      case 'invoices': return <InvoicesPage />;
      case 'customers': return <CustomersPage />;
      case 'purchases': return <PurchasesPage />;
      case 'jobcards': return <JobCardsPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      case 'mobile': return <MobilePage />;
      case 'billing': return <BillingPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <>
      <PWAInstallPrompt />
      <Layout active={effectiveKey} onNavigate={handleNav}>
        <Suspense fallback={<div className="flex h-full items-center justify-center p-12"><Spinner label={tr('loading', lang)} /></div>}>
          {canAccess(role, effectiveKey, organization?.id, activeEmployee?.permissions) ? renderPage() : (
            <Card><CardBody>
              <div className="flex flex-col items-center justify-center py-16 text-surface-400">
                <ShieldAlert className="w-10 h-10 mb-3" />
                <p className="text-sm">{tr('noPermission', lang)}</p>
              </div>
            </CardBody></Card>
          )}
        </Suspense>
      </Layout>
    </>
  );
}

function Gate() {
  const { session, booting, setRole, setStaffName, signOut, organization } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const { activeEmployee, setActiveEmployee } = useAuth();

  const [mockReady, setMockReady] = useState(false);

  useEffect(() => {
    if (session && organization?.id) {
      generateMockData(organization.id);
      setMockReady(true);
    }
  }, [session, organization?.id]);

  useEffect(() => {
    const handleSwitch = () => {
      setActiveEmployee(null);
    };
    window.addEventListener('switchUser', handleSwitch);
    return () => window.removeEventListener('switchUser', handleSwitch);
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Spinner label="جاري التحميل..." />
      </div>
    );
  }

  if (!session) {
    if (showSignUp) {
      return <SignUpPage onLoginClick={() => setShowSignUp(false)} />;
    }
    return <LoginPage onSignUpClick={() => setShowSignUp(true)} />;
  }

  if (!mockReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Spinner label="جاري التحميل..." />
      </div>
    );
  }

  if (!activeEmployee) {
    return <PinEntryScreen onSuccess={(staff) => {
      setActiveEmployee(staff);
      setRole(staff.role as any);
      setStaffName(staff.name);
    }} onLogout={() => signOut()} />;
  }

  return <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

export default App;
