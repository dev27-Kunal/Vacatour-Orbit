import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApp } from "@/providers/AppProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { loginSchema } from "@shared/schema";
import type { LoginCredentials } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/page-wrapper";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { LanguageSelector } from "@/components/language-selector";

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login, isLoading, user, error } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const onSubmit = async (data: LoginCredentials) => {
    setLoginError(null);
    const result = await login(data.email, data.password);

    if (result.success) {
      setLocation("/dashboard");
    } else {
      // Set user-friendly error message based on the error from login
      const errorMsg = result.error || t('auth.errors.loginFailed');

      if (errorMsg.includes("Invalid login credentials") || errorMsg.includes("Invalid email or password")) {
        setLoginError(t('auth.errors.invalidCredentials'));
      } else if (errorMsg.includes("Email not confirmed")) {
        setLoginError(t('auth.errors.emailNotConfirmed'));
      } else {
        setLoginError(errorMsg || t('auth.errors.tryAgainLater'));
      }
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <Card className="w-full max-w-md shadow-xl border-0 backdrop-blur-sm bg-white relative">
        {/* Language Selector in top-right corner of card */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>
        <CardHeader className="text-center pb-8">
          <div className="text-2xl font-bold text-gradient mb-2">Vacature ORBIT</div>
          <CardTitle className="text-3xl font-bold text-foreground">
            {t('auth.welcomeBack')}
          </CardTitle>
          <p className="mt-2 text-muted-foreground">
            {t('auth.loginToAccount')}
          </p>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {loginError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {loginError}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-login">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-gray-700">{t('auth.emailAddress')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        data-testid="input-email"
                        className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!text-gray-700">{t('auth.password')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder={t('auth.passwordPlaceholder')}
                          data-testid="input-password"
                          className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" data-testid="checkbox-remember" />
                  <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('auth.rememberMe')}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-600 hover:text-primary-500"
                  data-testid="link-forgot-password"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full btn-gradient rounded-full font-semibold py-3 text-lg"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.login')}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.noAccount')}{" "}
              <Link href="/register" className="text-primary hover:text-primary-600 font-medium" data-testid="link-to-register">
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>

          {/* Test Accounts Info */}
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Accounts:</strong>
              <div className="text-xs mt-1 space-y-1">
                <div>Bedrijf: bedrijf@test.nl (Test1234)</div>
                <div>ZZP: zzp@test.nl (Test1234)</div>
                <div>Bureau: bureau@test.nl (Test1234)</div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      </div>

      <ForgotPasswordModal 
        open={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </PageWrapper>
  );
}
