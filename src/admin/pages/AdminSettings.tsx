import React, { useState } from 'react';
import { Shield, Key, Mail, User, Clock, CheckCircle2, Lock } from 'lucide-react';
import { Lang } from '../lib/i18n';
import { AdminUserPasswordManagement } from '../components/AdminUserPasswordManagement';
import { validatePassword } from '@/lib/passwordValidator';

export function AdminSettings({ lang }: { lang: Lang }) {
  const [activeTab, setActiveTab] = useState<'admin_security' | 'tenant_passwords'>('admin_security');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    const currentStored = localStorage.getItem('saas_admin_pass') || 'admin123';
    if (currentPassword !== currentStored) {
      setMessage(lang === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password incorrect');
      return;
    }

    const val = validatePassword(newPassword);
    if (!val.isValid) {
      setMessage(lang === 'ar' ? val.errorsAr.join('. ') : val.errors.join('. '));
      return;
    }

    localStorage.setItem('saas_admin_pass', newPassword);
    localStorage.setItem('saas_admin_pass_last_changed', new Date().toISOString());
    setMessage(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Log the action without exposing password
    const activity = JSON.parse(localStorage.getItem('saas_admin_activity') || '[]');
    activity.push({
      admin: 'platform_admin',
      action: 'Change Admin Password',
      targetUser: 'admin@saas-platform.com',
      date: new Date().toISOString()
    });
    localStorage.setItem('saas_admin_activity', JSON.stringify(activity));
  };

  const lastChanged = localStorage.getItem('saas_admin_pass_last_changed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            {lang === 'ar' ? 'إعدادات الأمان وحسابات المشتركين' : 'Security & Account Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar' ? 'إدارة أمان حساب الإدارة وإدارة كلمات مرور المنشآت المصرح لها' : 'Manage platform admin security and tenant accounts password management'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('admin_security')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'admin_security'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'أمان حساب الإدارة' : 'Admin Security'}
          </button>
          <button
            onClick={() => setActiveTab('tenant_passwords')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tenant_passwords'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            {lang === 'ar' ? 'إدارة كلمات مرور المشتركين' : 'Tenant Password Management'}
          </button>
        </div>
      </div>

      {activeTab === 'tenant_passwords' ? (
        <AdminUserPasswordManagement lang={lang} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
              {lang === 'ar' ? 'معلومات حساب الإدارة' : 'Account Information'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-500">{lang === 'ar' ? 'حساب الإدارة' : 'Admin Account'}</p>
                  <p className="font-bold text-slate-900">Platform Admin</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-500">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                  <p className="font-bold text-slate-900">admin@saas-platform.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-500">{lang === 'ar' ? 'الصلاحيات' : 'Role'}</p>
                  <p className="font-bold text-slate-900">platform_admin</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-700">{lang === 'ar' ? 'حالة الأمان' : 'Security Status'}</p>
                  <p className="font-bold text-emerald-800">{lang === 'ar' ? 'نشط ومحمي' : 'Active and Protected'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-500">{lang === 'ar' ? 'آخر تغيير لكلمة المرور' : 'Password Last Changed'}</p>
                  <p className="font-bold text-slate-900">{lastChanged ? new Date(lastChanged).toLocaleString() : (lang === 'ar' ? 'غير متوفر' : 'N/A')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
              {lang === 'ar' ? 'تغيير كلمة مرور الإدارة' : 'Change Admin Password'}
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none text-left"
                    required
                  />
                  <Key className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none text-left"
                    required
                  />
                  <Key className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  🔒 {lang === 'ar' ? '9 أحرف أو أكثر، حرف كبير، حرف صغير، رقم ورمز خاص' : '9+ characters, uppercase, lowercase, number and symbol'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none text-left"
                    required
                  />
                  <Key className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('بنجاح') || message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-4">
                {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
