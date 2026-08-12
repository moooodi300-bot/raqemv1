import React, { useState, useEffect } from 'react';
import { Shield, Key, Mail, User, Clock, CheckCircle2 } from 'lucide-react';
import { Lang } from '../lib/i18n';

export function AdminSettings({ lang }: { lang: Lang }) {
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
    // Simple frontend logic for changing the admin password in local storage
    const currentStored = localStorage.getItem('saas_admin_pass') || 'admin123';
    if (currentPassword !== currentStored) {
      setMessage(lang === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password incorrect');
      return;
    }
    if (newPassword.length < 9) {
      setMessage(lang === 'ar' ? 'يجب أن تكون كلمة المرور 9 أحرف على الأقل' : 'Password must be at least 9 characters');
      return;
    }

    localStorage.setItem('saas_admin_pass', newPassword);
    localStorage.setItem('saas_admin_pass_last_changed', new Date().toISOString());
    setMessage(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    // Log the action
    const activity = JSON.parse(localStorage.getItem('saas_admin_activity') || '[]');
    activity.push({
      action: 'Change Password',
      target: 'Admin Account',
      date: new Date().toISOString()
    });
    localStorage.setItem('saas_admin_activity', JSON.stringify(activity));
  };

  const lastChanged = localStorage.getItem('saas_admin_pass_last_changed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          {lang === 'ar' ? 'أمان الإدارة (Admin Security)' : 'Admin Security'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
            {lang === 'ar' ? 'معلومات الحساب' : 'Account Information'}
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
            {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
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
                {lang === 'ar' ? 'يجب أن تحتوي على 9 أحرف على الأقل، حروف كبيرة وصغيرة، وأرقام ورموز' : 'Must be at least 9 characters long, contain uppercase, lowercase, numbers and symbols'}
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
    </div>
  );
}
