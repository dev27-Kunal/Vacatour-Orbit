import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ArrowLeft, CreditCard } from "lucide-react";

// Load Stripe outside of component render
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
import { PageWrapper } from "@/components/page-wrapper";
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

interface CheckoutFormProps {
  amount: number;
  description: string;
}

const CheckoutForm = ({ amount, description }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: t('payment.failed'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('payment.successful'),
        description: t('payment.thankYou'),
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-background rounded-lg">
        <h3 className="font-medium text-lg text-foreground mb-2">{t('payment.orderSummary')}</h3>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{description}</span>
          <span className="font-semibold text-foreground">€{(amount / 100).toFixed(2)}</span>
        </div>
      </div>
      
      <PaymentElement 
        data-testid="payment-element"
        options={{
          layout: "tabs"
        }}
      />
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full"
        data-testid="button-submit-payment"
      >
        {isLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
        ) : (
          <CreditCard className="w-4 h-4 mr-2" />
        )}
        {isLoading ? t('payment.processing') : `${t('payment.pay')} €${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [amount] = useState(2500); // €25.00 as example
  const [description] = useState("Premium Job Posting");
  const { t } = useTranslation();

  // Check if Stripe is configured
  if (!STRIPE_PUBLIC_KEY) {
    console.log('Stripe key not found. Looking for VITE_STRIPE_PUBLISHABLE_KEY');
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md mx-auto px-4">
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle className="text-center text-foreground">Betalingsservice niet beschikbaar</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  De betalingsservice is momenteel niet geconfigureerd.
                </p>
                <p className="text-sm text-muted-foreground">
                  In productie wordt dit automatisch geconfigureerd.
                </p>
                <Link href="/dashboard">
                  <Button className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Terug naar Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    );
  }

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiRequest("/api/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount, description }),
    })
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error);
      });
  }, [amount, description]);

  if (!clientSecret) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">{t('payment.loading')}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="link-back-dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
        </div>

        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('payment.checkout')}
            </CardTitle>
            <CardDescription>
              {t('payment.securePayment')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe'
                }
              }}
            >
              <CheckoutForm amount={amount} description={description} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>{t('payment.testMode')}</p>
        </div>
        </div>
      </div>
    </PageWrapper>
  );
}