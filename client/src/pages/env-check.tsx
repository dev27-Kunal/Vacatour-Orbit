import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function EnvCheck() {
  const { t } = useTranslation();
  // Check all Stripe-related environment variables
  const envVars: Record<string, any> = {
    'VITE_STRIPE_PUBLISHABLE_KEY': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    'VITE_STRIPE_PUBLIC_KEY': import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'MODE': import.meta.env.MODE,
    'PROD': import.meta.env.PROD,
    'DEV': import.meta.env.DEV,
  };

  // Get all VITE_ variables
  const allViteVars = Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      acc[key] = import.meta.env[key];
      return acc;
    }, {} as Record<string, any>);

  const stripeConfigured = !!envVars['VITE_STRIPE_PUBLISHABLE_KEY'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="feature-card bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('envCheck.title', { defaultValue: 'Environment Variables Check' })}
            {stripeConfigured ? (
              <Badge className="bg-green-100 text-green-800">{t('envCheck.stripeConfigured', { defaultValue: 'Stripe Configured' })}</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">{t('envCheck.stripeNotConfigured', { defaultValue: 'Stripe Not Configured' })}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Critical Stripe Variables */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {t('envCheck.criticalStripe', { defaultValue: 'Critical Stripe Configuration' })}
            </h3>
            <div className="space-y-2">
              {['VITE_STRIPE_PUBLISHABLE_KEY', 'VITE_STRIPE_PUBLIC_KEY'].map(key => (
                <div key={key} className="flex items-center justify-between p-2 bg-background rounded">
                  <code className="text-sm">{key}</code>
                  <div className="flex items-center gap-2">
                    {envVars[key] ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-500">
                          {String(envVars[key]).substring(0, 20)}...
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500">{t('envCheck.notSet', { defaultValue: 'NOT SET' })}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Environment Variables */}
          <div>
            <h3 className="font-semibold mb-3">{t('envCheck.allEnvVars', { defaultValue: 'All Environment Variables' })}</h3>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-background rounded">
                  <code className="text-sm">{key}</code>
                  <div className="flex items-center gap-2">
                    {value ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-500">
                          {typeof value === 'string' && value.length > 20
                            ? `${value.substring(0, 20)}...`
                            : String(value)}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500">{t('envCheck.notSet', { defaultValue: 'NOT SET' })}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All VITE_ variables found */}
          <div>
            <h3 className="font-semibold mb-3">{t('envCheck.allViteVars', { defaultValue: 'All VITE_ Variables Found' })}</h3>
            {Object.keys(allViteVars).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(allViteVars).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-background rounded">
                    <code className="text-sm">{key}</code>
                    <span className="text-xs text-gray-500">
                      {typeof value === 'string' && value.length > 30
                        ? `${value.substring(0, 30)}...`
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500">{t('envCheck.noViteVars', { defaultValue: 'No VITE_ variables found!' })}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">📝 {t('envCheck.setupTitle', { defaultValue: 'Vercel Setup Instructions:' })}</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>{t('envCheck.step1', { defaultValue: 'Go to Vercel Dashboard → Settings → Environment Variables' })}</li>
              <li>{t('envCheck.step2', { defaultValue: 'Add: ' })}<code>VITE_STRIPE_PUBLISHABLE_KEY</code> = <code>pk_test_...</code></li>
              <li>{t('envCheck.step3', { defaultValue: 'Make sure to click "Save"' })}</li>
              <li>{t('envCheck.step4', { defaultValue: 'Click "Redeploy" to apply changes' })}</li>
              <li>{t('envCheck.step5', { defaultValue: 'Wait 2-3 minutes for deployment' })}</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
