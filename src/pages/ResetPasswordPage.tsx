import { useState, useEffect, FormEvent } from 'react';
import { Key, Shield, AlertCircle, CheckCircle2, ArrowRight, Loader2, Building2, Eye, EyeOff, Globe } from 'lucide-react';
import { Card, CardBody, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { validatePassword, PASSWORD_REQUIREMENTS_HINT_AR, PASSWORD_REQUIREMENTS_HINT_EN } from '@/lib/passwordValidator';

interface ResetPasswordPageProps {
  onGoToLogin: (mode?: 'signin' | 'forgot_password') => void;
  lang?: 'ar' | 'en';
}

export function ResetPasswordPage({ onGoToLogin, lang: initialLang = 'ar' }: ResetPasswordPageProps) {
  const [lang, setLang] = useState<'ar' | 'en'>(initialLang);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  useEffect(() => {
    // Check if recovery session or URL code/hash access_token exists
    const checkSession = async () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;
        const searchParams = new URLSearchParams(search);
        const code = searchParams.get('code');

        // PKCE Code exchange
        if (code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && exchangeData?.session) {
            setIsTokenValid(true);
            return;
          }
        }

        // Implicit grant / hash recovery token checks
        const hasHashToken = hash.includes('access_token') || hash.includes('type=recovery');
        const hasQueryToken = search.includes('token') || search.includes('type=recovery') || search.includes('token_hash');

        const { data: { session } } = await supabase.auth.getSession();

        if (session || hasHashToken || hasQueryToken) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch {
        setIsTokenValid(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsTokenValid(true);
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

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

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setError(updateErr.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء تحديث كلمة المرور' : 'An error occurred updating password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 left-4 lg:top-8 lg:left-8">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-surface-200 rounded-xl text-sm font-bold text-surface-600 hover:text-surface-900 shadow-sm transition-all"
        >
          <Globe className="w-4 h-4" />
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-blue-600 text-white shadow-xl shadow-primary-900/20 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-surface-900">
            {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </h1>
          <p className="text-surface-500 text-sm">
            {lang === 'ar' ? 'قم بإنشاء كلمة مرور جديدة وأكثر أماناً لحسابك' : 'Create a new, strong password for your account'}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white rounded-3xl">
          <CardBody className="p-6 md:p-8">
            {isTokenValid === false ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900">
                  {lang === 'ar' ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي' : 'Password reset link is invalid or expired'}
                </h3>
                <p className="text-sm text-surface-500">
                  {lang === 'ar'
                    ? 'يبدو أن رابط الاستعادة قد انتهت صلاحيته أو تم استخدامه مسبقاً. يرجى طلب رابط جديد.'
                    : 'The recovery link seems to have expired or been used already. Please request a new link.'}
                </p>
                <Button
                  onClick={() => onGoToLogin('forgot_password')}
                  className="w-full h-11 text-sm font-bold rounded-xl mt-4 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {lang === 'ar' ? 'إرسال رابط جديد' : 'Send New Reset Link'}
                </Button>
              </div>
            ) : success ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">
                  {lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password updated successfully'}
                </h3>
                <p className="text-sm text-surface-600">
                  {lang === 'ar'
                    ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة الخاصة بك.'
                    : 'You can now log in using your new password.'}
                </p>
                <Button
                  onClick={() => onGoToLogin('signin')}
                  className="w-full h-11 text-sm font-bold rounded-xl mt-4 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-start">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-rose-800">{error}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-surface-700">
                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full ps-11 pe-10 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-left"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 end-0 pe-3 flex items-center text-surface-400 hover:text-surface-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-surface-500 font-medium pt-1">
                    🔒 {lang === 'ar' ? PASSWORD_REQUIREMENTS_HINT_AR : PASSWORD_REQUIREMENTS_HINT_EN}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-surface-700">
                    {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full ps-11 pe-10 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-left"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 end-0 pe-3 flex items-center text-surface-400 hover:text-surface-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold rounded-xl mt-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 shadow-lg shadow-primary-900/20 text-white"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : lang === 'ar' ? (
                    'تغيير كلمة المرور'
                  ) : (
                    'Update Password'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => onGoToLogin('signin')}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-surface-600 hover:text-surface-900 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

