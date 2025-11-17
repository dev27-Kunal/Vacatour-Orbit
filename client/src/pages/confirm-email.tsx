import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function ConfirmEmail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/confirm-email");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState("");
  const { t } = useTranslation();
  
  // Get query parameters from URL
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    confirmEmail();
  }, [token, email]);

  const confirmEmail = async () => {
    if (!token || !email) {
      setStatus("error");
      setMessage(t('auth.confirmEmail.invalidLink'));
      return;
    }

    try {
      // First verify the token exists and is not expired
      const { data: confirmationData, error: fetchError } = await supabase
        .from("email_confirmations")
        .select("*")
        .eq("token", token)
        .eq("email", decodeURIComponent(email))
        .single();

      if (fetchError || !confirmationData) {
        setStatus("error");
        setMessage(t('auth.confirmEmail.invalidOrExpired'));
        return;
      }

      // Check if already confirmed
      if (confirmationData.confirmed_at) {
        setStatus("success");
        setMessage(t('auth.confirmEmail.alreadyConfirmed'));
        return;
      }

      // Check if expired
      const expiresAt = new Date(confirmationData.expires_at);
      if (expiresAt < new Date()) {
        setStatus("expired");
        setMessage(t('auth.confirmEmail.linkExpired'));
        return;
      }

      // Mark as confirmed
      const { error: updateError } = await supabase
        .from("email_confirmations")
        .update({ 
          confirmed_at: new Date().toISOString() 
        })
        .eq("token", token);

      if (updateError) {
        console.error("Error updating confirmation:", updateError);
        setStatus("error");
        setMessage(t('auth.confirmEmail.genericError'));
        return;
      }

      // Update user verification status
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ 
          is_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq("id", confirmationData.user_id);

      if (userUpdateError) {
        console.error("Error updating user verification:", userUpdateError);
        // Don't fail the whole process if user update fails
      }

      setStatus("success");
      setMessage(t('auth.confirmEmail.success'));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login?verified=true");
      }, 3000);
      
    } catch (error) {
      console.error("Email confirmation error:", error);
      setStatus("error");
      setMessage(t('auth.confirmEmail.genericError'));
    }
  };

  const requestNewConfirmation = async () => {
    if (!email) {return;}

    try {
      const response = await apiPost("/api/auth/resend-confirmation", {
        email: decodeURIComponent(email)
      });

      if (response.success) {
        setMessage(t('auth.confirmEmail.resent'));
      } else {
        setMessage(response.error || t('auth.confirmEmail.resendError'));
      }
    } catch (error) {
      console.error("Error requesting new confirmation:", error);
      setMessage(t('auth.confirmEmail.resendError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
            {status === "expired" && (
              <Mail className="h-12 w-12 text-yellow-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && t('auth.confirmEmail.titleLoading')}
            {status === "success" && t('auth.confirmEmail.titleSuccess')}
            {status === "error" && t('auth.confirmEmail.titleError')}
            {status === "expired" && t('auth.confirmEmail.titleExpired')}
          </CardTitle>
          
          <CardDescription className="mt-2">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "success" && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {t('auth.confirmEmail.redirectingToLogin')}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === "expired" && (
            <>
              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 mb-4">
                <Mail className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  {t('auth.confirmEmail.expiredHint')}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={requestNewConfirmation}
                className="w-full"
                variant="default"
              >
                {t('auth.confirmEmail.resendButton')}
              </Button>
            </>
          )}

          <div className="mt-6 text-center">
            {status !== "loading" && status !== "success" && (
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full"
              >
                {t('auth.confirmEmail.goToLogin')}
              </Button>
            )}
            
            {status === "success" && (
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
              >
                {t('auth.confirmEmail.loginNow')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
