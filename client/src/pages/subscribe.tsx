import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/providers/AppProvider";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/page-wrapper";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: t('subscribe.paymentFailedTitle'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('subscribe.activatedTitle'),
        description: t('subscribe.activatedDesc'),
      });
      setLocation("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isLoading}
        data-testid="button-subscribe"
      >
        {isLoading ? t('subscribe.activating') : t('subscribe.startTrialCta')}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user } = useApp();
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if Stripe is configured
  if (!STRIPE_PUBLIC_KEY) {
    console.log('Stripe key not found. Available env vars:', Object.keys(import.meta.env).filter(k => k.includes('STRIPE')));
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('subscribe.notAvailableTitle')}</h1>
            <p className="text-muted-foreground mb-4">
              De betalingsservice is momenteel niet geconfigureerd.
            </p>
            <p className="text-sm text-muted-foreground">
              Stripe key wordt gezocht in: VITE_STRIPE_PUBLISHABLE_KEY
            </p>
            <Button onClick={() => setLocation("/dashboard")} className="mt-4">
              Ga naar Dashboard
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    // Create subscription as soon as the page loads
    apiRequest("/api/create-subscription", {
      method: "POST",
    })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het laden van de betalingspagina.",
          variant: "destructive",
        });
      });
  }, [user]);

  if (!user) {
    return null;
  }

  if (isLoading || !clientSecret) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
            <p className="text-muted-foreground">{t('subscribe.loadingPage')}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Plan Details */}
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('subscribe.welcomeTitle')}</h1>
            <p className="text-muted-foreground">
              {t('subscribe.freeTrialBlurb')}
            </p>
          </div>

          <Card className="feature-card bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <CardTitle>Professional Plan</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t('subscribe.freeBadge')}
                </Badge>
              </div>
              <CardDescription>
                Alles wat je nodig hebt om talent te vinden of opdrachten te krijgen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                €29<span className="text-sm font-normal text-muted-foreground">/{t('subscription.intervals.month')}</span>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">{t('subscription.planFeatures.ENTERPRISE.0')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('subscribe.features.zzpProfiles')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('subscribe.features.messaging')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('subscribe.features.search')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('subscribe.features.analytics')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t('subscribe.features.support')}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{t('subscribe.freeTrialTitle')}</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">{t('subscribe.freeTrialDesc')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="space-y-6">
          <Card className="feature-card bg-card">
            <CardHeader>
              <CardTitle>Betalingsgegevens</CardTitle>
              <CardDescription>
                Vul je betalingsgegevens in om je gratis proefperiode te starten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
            </CardContent>
          </Card>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>
              {t('subscribe.termsPrefix')}{" "}
              <a href="/terms" className="underline hover:text-foreground">
                {t('subscribe.termsLink')}
              </a>{" "}
              {t('subscribe.and')}{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                {t('subscribe.privacyLink')}
              </a>
            </p>
          </div>
        </div>
        </div>
      </div>
    </PageWrapper>
  );
}
