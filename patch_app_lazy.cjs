const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import { DashboardPage } from '@/pages/DashboardPage';
import { SalesPage } from '@/pages/SalesPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { PurchasesPage } from '@/pages/PurchasesPage';
import { JobCardsPage } from '@/pages/JobCardsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { MobilePage } from '@/pages/MobilePage';
import { BillingPage } from '@/pages/BillingPage';`;

const importReplacement = `import React, { Suspense } from 'react';
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const SalesPage = React.lazy(() => import('@/pages/SalesPage').then(module => ({ default: module.SalesPage })));
const InvoicesPage = React.lazy(() => import('@/pages/InvoicesPage').then(module => ({ default: module.InvoicesPage })));
const CustomersPage = React.lazy(() => import('@/pages/CustomersPage').then(module => ({ default: module.CustomersPage })));
const PurchasesPage = React.lazy(() => import('@/pages/PurchasesPage').then(module => ({ default: module.PurchasesPage })));
const JobCardsPage = React.lazy(() => import('@/pages/JobCardsPage').then(module => ({ default: module.JobCardsPage })));
const ReportsPage = React.lazy(() => import('@/pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const MobilePage = React.lazy(() => import('@/pages/MobilePage').then(module => ({ default: module.MobilePage })));
const BillingPage = React.lazy(() => import('@/pages/BillingPage').then(module => ({ default: module.BillingPage })));`;

code = code.replace(importTarget, importReplacement);

// We need to wrap the switch statement components with Suspense
const switchTarget = `    switch (activePage) {
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
    }`;

const switchReplacement = `    const renderPage = () => {
      switch (activePage) {
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
    return <Suspense fallback={<Spinner label="جاري التحميل..." />}>{renderPage()}</Suspense>;`;
    
code = code.replace(switchTarget, switchReplacement);

fs.writeFileSync('src/App.tsx', code);
