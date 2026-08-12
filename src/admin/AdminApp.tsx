import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, CreditCard, DownloadCloud, LifeBuoy, Settings, LogOut, FileText, Globe } from 'lucide-react';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBusinesses } from './pages/AdminBusinesses';
import { AdminSubscriptions } from './pages/AdminSubscriptions';
import { AdminExports } from './pages/AdminExports';
import { AdminSupport } from './pages/AdminSupport';
import { AdminPlans } from './pages/AdminPlans';
import { AdminSettings } from './pages/AdminSettings';
import { AdminBusinessDetails } from './pages/AdminBusinessDetails';
import { Lang, tr } from './lib/i18n';

export function AdminApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Language setup
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('saas_admin_lang') as Lang;
    if (savedLang === 'ar' || savedLang === 'en') {
      setLang(savedLang);
    }
    const auth = localStorage.getItem('saas_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('saas_admin_lang', newLang);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStored = localStorage.getItem('saas_admin_pass') || 'admin123';
    if (password === currentStored) {
      localStorage.setItem('saas_admin_auth', 'true');
      setIsAuthenticated(true);
      
      const activity = JSON.parse(localStorage.getItem('saas_admin_activity') || '[]');
      activity.push({
        action: 'Admin Login',
        target: 'SaaS Admin Portal',
        date: new Date().toISOString()
      });
      localStorage.setItem('saas_admin_activity', JSON.stringify(activity));
    } else {
      alert(lang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Invalid password');
    }
  };

  const logout = () => {
    localStorage.removeItem('saas_admin_auth');
    setIsAuthenticated(false);
    
    const activity = JSON.parse(localStorage.getItem('saas_admin_activity') || '[]');
    activity.push({
      action: 'Admin Logout',
      target: 'SaaS Admin Portal',
      date: new Date().toISOString()
    });
    localStorage.setItem('saas_admin_activity', JSON.stringify(activity));
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-slate-100" dir={dir}>
        <div className="absolute top-4 end-4">
          <button onClick={toggleLanguage} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition">
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">{tr('saasAdminPortal', lang)}</h1>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={tr('adminPassword', lang)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-start"
            dir="ltr"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
            {tr('accessDashboard', lang)}
          </button>
          <div className="mt-4 text-center">
            <a href="/" className="text-slate-500 hover:text-slate-300 text-sm">{tr('returnToApp', lang)}</a>
          </div>
        </form>
      </div>
    );
  }

  const navigate = (tab: string) => {
    setActiveTab(tab);
    setSelectedTenant(null);
  };

  const navItems = [
    { id: 'dashboard', label: tr('dashboard', lang), icon: LayoutDashboard },
    { id: 'businesses', label: tr('businesses', lang), icon: Building2 },
    { id: 'subscriptions', label: tr('subscriptions', lang), icon: CreditCard },
    { id: 'exports', label: tr('dataExport', lang), icon: DownloadCloud },
    { id: 'support', label: tr('support', lang), icon: LifeBuoy },
    { id: 'plans', label: tr('plans', lang), icon: FileText },
    { id: 'settings', label: lang === 'ar' ? 'أمان الإدارة' : 'Admin Security', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 start-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white truncate">{tr('saasAdminPortal', lang)}</span>
          </div>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id && !selectedTenant
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-400 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            {tr('logout', lang)}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen ms-64">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
             {selectedTenant ? tr('subscriptionDetails', lang) : navItems.find(i => i.id === activeTab)?.label}
          </h2>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all border border-slate-200"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </header>
        <div className="p-8">
          {selectedTenant ? (
             <AdminBusinessDetails tenantId={selectedTenant} onBack={() => setSelectedTenant(null)} lang={lang} />
          ) : (
            <>
              {activeTab === 'dashboard' && <AdminDashboard lang={lang} />}
              {activeTab === 'businesses' && <AdminBusinesses onSelectTenant={setSelectedTenant} lang={lang} />}
              {activeTab === 'subscriptions' && <AdminSubscriptions lang={lang} />}
              {activeTab === 'exports' && <AdminExports lang={lang} />}
              {activeTab === 'support' && <AdminSupport lang={lang} />}
              {activeTab === 'plans' && <AdminPlans lang={lang} />}
              {activeTab === 'settings' && <AdminSettings lang={lang} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
