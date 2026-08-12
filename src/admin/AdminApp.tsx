import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, CreditCard, DownloadCloud, LifeBuoy, Settings, LogOut, Users, FileText } from 'lucide-react';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBusinesses } from './pages/AdminBusinesses';
import { AdminSubscriptions } from './pages/AdminSubscriptions';
import { AdminExports } from './pages/AdminExports';
import { AdminSupport } from './pages/AdminSupport';
import { AdminPlans } from './pages/AdminPlans';
import { AdminBusinessDetails } from './pages/AdminBusinessDetails';

export function AdminApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('saas_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple demo password
      localStorage.setItem('saas_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const logout = () => {
    localStorage.removeItem('saas_admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-slate-100">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">SaaS Admin Portal</h1>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
            Access Dashboard
          </button>
          <div className="mt-4 text-center">
            <a href="/" className="text-slate-500 hover:text-slate-300 text-sm">Return to App</a>
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'exports', label: 'Data & Analytics', icon: DownloadCloud },
    { id: 'support', label: 'Support & Maintenance', icon: LifeBuoy },
    { id: 'plans', label: 'Subscription Plans', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SaaS Admin</span>
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
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-400 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
             {selectedTenant ? 'Business Details' : navItems.find(i => i.id === activeTab)?.label}
          </h2>
        </header>
        <div className="p-8">
          {selectedTenant ? (
             <AdminBusinessDetails tenantId={selectedTenant} onBack={() => setSelectedTenant(null)} />
          ) : (
            <>
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'businesses' && <AdminBusinesses onSelectTenant={setSelectedTenant} />}
              {activeTab === 'subscriptions' && <AdminSubscriptions />}
              {activeTab === 'exports' && <AdminExports />}
              {activeTab === 'support' && <AdminSupport />}
              {activeTab === 'plans' && <AdminPlans />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
