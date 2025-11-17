import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Receipt, CreditCard, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper } from "@/components/page-wrapper";
import { apiGet } from "@/lib/api-client";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const search = useSearch();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Extract session ID from URL parameters
    const params = new URLSearchParams(search);
    const id = params.get('session_id');
    if (id) {
      setSessionId(id);
      console.log('Payment completed successfully for session:', id);
    }
  }, [search]);

  // Verify the payment session (optional, for extra security)
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ["/api/subscription/verify-payment", sessionId],
    queryFn: async () => {
      if (!sessionId) {return null;}
      const response = await apiGet<{
        planName: string;
        amount?: number;
      }>(`/api/subscription/verify-payment`, { session_id: sessionId });
      if (!response.success) {
        throw new Error(response.error || "Failed to verify payment session");
      }
      return response.data;
    },
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 1000,
  });

  if (!sessionId) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-md mx-auto px-4">
            <Card className="text-center feature-card bg-card">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-foreground">
                  Betaling Ongeldig
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Geen geldig betaling sessie gevonden
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/payments">
                <Button className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Terug naar Betalingen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-md mx-auto px-4">
            <Card className="text-center feature-card bg-card">
              <CardContent className="py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Betaling verifiëren...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-md mx-auto px-4">
            <Card className="text-center feature-card bg-card">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-foreground">
                  Verificatie Mislukt
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Kon betaling niet verifiëren, maar deze is mogelijk wel succesvol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                Check je e-mail voor een bevestiging van Stripe
              </p>
              <div className="space-y-2">
                <Link href="/dashboard">
                  <Button className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Naar Dashboard
                  </Button>
                </Link>
                <Link href="/payments">
                  <Button variant="outline" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Bekijk Abonnement
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-md mx-auto px-4">
          <Card className="text-center feature-card bg-card">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-foreground">
                Betaling Succesvol!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Bedankt voor je abonnement op Vacature ORBIT
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionData && (
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-green-700 font-medium">
                  {sessionData.planName} Plan geactiveerd
                </p>
                {sessionData.amount && (
                  <p className="text-xs text-green-600">
                    €{(sessionData.amount / 100).toFixed(2)} per maand
                  </p>
                )}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Je abonnement is nu actief. Je ontvangt een bevestigingsmail van Stripe.
            </p>
            
            <div className="space-y-2">
              <Link href="/dashboard">
                <Button className="w-full" data-testid="button-dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Naar Dashboard
                </Button>
              </Link>
              
              <Link href="/payments">
                <Button variant="outline" className="w-full" data-testid="button-payments">
                  <Receipt className="w-4 h-4 mr-2" />
                  Bekijk Abonnement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageWrapper>
  );
}