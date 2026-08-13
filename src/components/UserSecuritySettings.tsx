import { useState } from 'react';
import { Key, Shield, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardBody, Button, Input, Label } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { validatePassword, PASSWORD_REQUIREMENTS_HINT_AR, PASSWORD_REQUIREMENTS_HINT_EN } from '@/lib/passwordValidator';

export function UserSecuritySettings() {
  const { updateUserPassword, lang } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    const val = validatePassword(newPassword);
    if (!val.isValid) {
      setError(lang === 'ar' ? val.errorsAr.join('. ') : val.errors.join('. '));
      return;
    }

    setLoading(true);

    const res = await updateUserPassword(newPassword);

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(
        lang === 'ar'
          ? 'تم تحديث كلمة المرور الخاصة بك بنجاح'
          : 'Your password has been updated successfully'
      );
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Card>
      <CardBody className="p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-surface-800">
              {lang === 'ar' ? 'أمان الحساب وكلمة المرور' : 'Account Security & Password'}
            </h3>
            <p className="text-xs text-surface-500">
              {lang === 'ar'
                ? 'قم بتحديث كلمة المرور الخاصة بحسابك للالتزام بأعلى معايير الأمان'
                : 'Update your account password adhering to strong security rules'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <Label className="font-bold">{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
            <div className="relative mt-1">
              <Input
                type="password"
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white pl-10 text-left font-mono"
              />
              <Key className="w-4 h-4 text-surface-400 absolute left-3 top-3" />
            </div>
            <p className="text-xs text-surface-500 font-medium pt-1">
              🔒 {lang === 'ar' ? PASSWORD_REQUIREMENTS_HINT_AR : PASSWORD_REQUIREMENTS_HINT_EN}
            </p>
          </div>

          <div>
            <Label className="font-bold">{lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</Label>
            <div className="relative mt-1">
              <Input
                type="password"
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white pl-10 text-left font-mono"
              />
              <Shield className="w-4 h-4 text-surface-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 font-bold px-8 text-white"
            >
              {loading ? (lang === 'ar' ? 'جاري التحديث...' : 'Updating...') : (lang === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Save New Password')}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
