import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, AlertCircle, LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'initial' | 'verifying' | 'ready' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  // Try to establish a Supabase session from the URL (PKCE/recovery flows)
  useEffect(() => {
    let cancelled = false;

    const parseHashParams = () => {
      const hash = window.location.hash || '';
      const raw = hash.startsWith('#') ? hash.slice(1) : hash;
      const sp = new URLSearchParams(raw);
      return {
        access_token: sp.get('access_token') || undefined,
        refresh_token: sp.get('refresh_token') || undefined,
        type: sp.get('type') || undefined,
      };
    };

    const ensureSession = async () => {
      try {
        // Small delay in case the SDK auto-detect kicks in
        await new Promise((r) => setTimeout(r, 30));

        // 1) Already have a session?
        const { data: s1 } = await supabase.auth.getSession();
        if (s1.session) {
          if (!cancelled) {
            setStatus('ready');
            setMessage(t('auth.resetPassword.enterNew', { defaultValue: 'Enter your new password.' }));
          }
          return;
        }

        // 2) Try PKCE code exchange
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (_) {
            // ignore
          }
        }

        // 3) Try hash tokens (#access_token & #refresh_token)
        const { access_token, refresh_token } = parseHashParams();
        if (access_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token: refresh_token || '' });
          } catch (_) {
            // ignore and continue
          }
        }

        // 4) Check again
        const { data: s2 } = await supabase.auth.getSession();
        if (s2.session) {
          if (!cancelled) {
            setStatus('ready');
            setMessage(t('auth.resetPassword.enterNew', { defaultValue: 'Enter your new password.' }));
          }
          return;
        }

        // 5) Give a clear error
        if (!cancelled) {
          setStatus('error');
          setMessage(t('auth.resetPassword.invalidLink', { defaultValue: 'The reset link is invalid or expired. Request a new link from the login page.' }));
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(t('auth.resetPassword.verifyError', { defaultValue: 'Something went wrong verifying the link. Please try again.' }));
        }
      }
    };

    ensureSession();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) {return;}

    if (!password || password.length < 8) {
      setStatus('error');
      setMessage(t('auth.resetPassword.minLength', { defaultValue: 'Password must be at least 8 characters.' }));
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(t('auth.resetPassword.mismatch', { defaultValue: 'Passwords do not match.' }));
      return;
    }

    setSubmitting(true);
    setStatus('verifying');
    setMessage(t('auth.resetPassword.updating', { defaultValue: 'Updating password...' }));
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus('error');
        setMessage(error.message || t('auth.resetPassword.updateError', { defaultValue: 'Could not update password. Please try again.' }));
        setSubmitting(false);
        return;
      }

      setStatus('success');
      setMessage(t('auth.resetPassword.success', { defaultValue: 'Your password has been updated. You can now log in.' }));
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || t('auth.resetPassword.genericError', { defaultValue: 'Something went wrong. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'verifying' && <Loader2 className="h-12 w-12 animate-spin text-primary-600" />}
            {status === 'ready' && <LockKeyhole className="h-12 w-12 text-primary-600" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-600" />}
            {status === 'error' && <AlertCircle className="h-12 w-12 text-red-600" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'ready' 
              ? t('auth.resetPassword.titleReady', { defaultValue: 'Set new password' }) 
              : t('auth.resetPassword.title', { defaultValue: 'Reset password' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status !== 'ready' && (
            <Alert className={status === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}>
              <AlertDescription className={status === 'error' ? 'text-red-800' : 'text-blue-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.resetPassword.newPassword', { defaultValue: 'New password' })}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.resetPassword.min8', { defaultValue: 'At least 8 characters' })}
                  className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.resetPassword.confirmPassword', { defaultValue: 'Confirm password' })}</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.resetPassword.repeatNew', { defaultValue: 'Repeat new password' })}
                  className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.resetPassword.change', { defaultValue: 'Change password' })}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/login')}>
                {t('auth.resetPassword.backToLogin', { defaultValue: 'Back to login' })}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
