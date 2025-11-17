import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle, XCircle, Clock, Star, Crown, Zap } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PageWrapper } from "@/components/page-wrapper";
import { apiGet, apiPost } from "@/lib/api-client";

const SUBSCRIPTION_PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 2900, // €29.00
    intervalKey: 'month',
    icon: Star,
    popular: false,
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 9900, // €99.00
    intervalKey: 'month',
    icon: Crown,
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 29900, // €299.00
    intervalKey: 'month',
    icon: Zap,
    popular: false,
  },
];

const PLAN_FEATURE_KEYS: Record<string, string[]> = {
  STARTER: [
    'subscription.planFeatures.STARTER.0',
    'subscription.planFeatures.STARTER.1',
    'subscription.planFeatures.STARTER.2',
    'subscription.planFeatures.STARTER.3',
    'subscription.planFeatures.STARTER.4'
  ],
  PROFESSIONAL: [
    'subscription.planFeatures.PROFESSIONAL.0',
    'subscription.planFeatures.PROFESSIONAL.1',
    'subscription.planFeatures.PROFESSIONAL.2',
    'subscription.planFeatures.PROFESSIONAL.3',
    'subscription.planFeatures.PROFESSIONAL.4',
    'subscription.planFeatures.PROFESSIONAL.5',
    'subscription.planFeatures.PROFESSIONAL.6',
    'subscription.planFeatures.PROFESSIONAL.7'
  ],
  ENTERPRISE: [
    'subscription.planFeatures.ENTERPRISE.0',
    'subscription.planFeatures.ENTERPRISE.1',
    'subscription.planFeatures.ENTERPRISE.2',
    'subscription.planFeatures.ENTERPRISE.3',
    'subscription.planFeatures.ENTERPRISE.4',
    'subscription.planFeatures.ENTERPRISE.5',
    'subscription.planFeatures.ENTERPRISE.6'
  ]
};

export default function PaymentsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Get current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscription"],
    queryFn: async () => {
      const response = await apiGet<{
        plan: string;
        status: string;
        currentPeriodEnd?: string;
      }>("/api/subscription");

      if (!response.success) {
        return { plan: 'STARTER', status: 'INACTIVE' };
      }

      return response.data;
    },
  });

  // Get payment history
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const response = await apiGet<Array<{
        id: string;
        amount: number;
        status: string;
        description: string;
        createdAt: string;
      }>>("/api/payments");

      if (!response.success) {
        return [];
      }

      return response.data;
    },
  });

  // Create Stripe checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiPost<{ url: string }>("/api/subscription/checkout", { planId });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create checkout session");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Fout",
          description: "Geen checkout URL ontvangen.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden bij het starten van de checkout.",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiPost<{ success: boolean }>("/api/subscription/cancel", {});

      if (!response.success) {
        throw new Error(response.error || "Failed to cancel subscription");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({
        title: "Abonnement opgezegd",
        description: "Je abonnement wordt aan het einde van de periode beëindigd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opzeggen van je abonnement.",
        variant: "destructive",
      });
    },
  });

  const isLoading = subscriptionLoading || paymentsLoading;

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">{t('account.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse feature-card bg-card">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const currentPlan = subscription?.plan || 'STARTER';
  const totalPayments = (payments || []).reduce((sum: number, payment: any) => sum + payment.amount, 0);
  const successfulPayments = (payments || []).filter((p: any) => p.status === 'COMPLETED').length;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('account.title')}</h1>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription" data-testid="tab-subscription">{t('subscription.tabs.subscription')}</TabsTrigger>
            <TabsTrigger value="plans" data-testid="tab-plans">{t('subscription.tabs.plans')}</TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">{t('subscription.tabs.payments')}</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
            <Card className="feature-card bg-card" data-testid="card-current-subscription">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('subscription.dashboard.currentSubscription')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{currentPlan} Plan</h3>
                    <Badge 
                      variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}
                      data-testid={`badge-status-${subscription?.status?.toLowerCase() || 'trial'}`}
                    >
                      {subscription?.status || 'TRIAL'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      €{SUBSCRIPTION_PLANS.find(p => p.id === currentPlan)?.price ? 
                        (SUBSCRIPTION_PLANS.find(p => p.id === currentPlan)!.price / 100).toFixed(2) : 
                        '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">{t('subscription.perMonth')}</div>
                  </div>
                </div>

                {subscription?.currentPeriodEnd && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">{t('subscription.dashboard.nextBilling')}</p>
                        <p className="text-blue-700">
                          {format(new Date(subscription.currentPeriodEnd), 'dd MMMM yyyy', { locale: nl })}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{t('subscription.plans.benefitsTitle')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PLAN_FEATURE_KEYS[currentPlan]?.map((key, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{t(key)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {subscription?.status === 'ACTIVE' && (
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => cancelSubscriptionMutation.mutate()}
                      disabled={cancelSubscriptionMutation.isPending}
                      data-testid="button-cancel-subscription"
                    >
                      {cancelSubscriptionMutation.isPending ? t('subscription.cancelling') : t('subscription.cancelSubscription')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('subscription.plans.chooseTitle')}</h2>
              <p className="text-gray-600">{t('subscription.plans.chooseSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative feature-card bg-card ${plan.popular ? 'ring-2 ring-blue-600' : ''} ${isCurrentPlan ? 'bg-blue-50' : ''}`}
                    data-testid={`card-plan-${plan.id.toLowerCase()}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white">{t('subscription.plans.popular')}</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-lg ${plan.popular ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon className={`h-8 w-8 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{t(`subscription.planNames.${plan.id}`)}</CardTitle>
                      <div className="text-3xl font-bold text-foreground">
                        €{(plan.price / 100).toFixed(2)}
                        <span className="text-sm font-normal text-muted-foreground">/{t(`subscription.intervals.${plan.intervalKey}`)}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {PLAN_FEATURE_KEYS[plan.id].map((key, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{t(key)}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {isCurrentPlan ? (
                        <Button className="w-full" disabled>
                          {t('subscription.plans.currentPlan')}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => createCheckoutMutation.mutate(plan.id)}
                          disabled={createCheckoutMutation.isPending}
                          data-testid={`button-select-${plan.id.toLowerCase()}`}
                        >
                          {createCheckoutMutation.isPending ? t('subscription.plans.toCheckout') : t('subscription.plans.selectPlan')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="feature-card bg-card" data-testid="card-total-amount">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('subscription.payments.totalPaid')}</p>
                      <p className="text-2xl font-bold text-foreground">€{(totalPayments / 100).toFixed(2)}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card bg-card" data-testid="card-successful-count">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('subscription.payments.successful')}</p>
                      <p className="text-2xl font-bold text-foreground">{successfulPayments}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card bg-card" data-testid="card-payment-rate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('subscription.payments.successRate')}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {payments && payments.length > 0 ? Math.round((successfulPayments / payments.length) * 100) : 0}%
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card className="feature-card bg-card" data-testid="card-payment-history">
              <CardHeader>
                <CardTitle>{t('subscription.payments.historyTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments && payments.length > 0 ? (
                    payments.map((payment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            payment.status === 'COMPLETED' ? 'bg-green-100' :
                            payment.status === 'PENDING' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            {payment.status === 'COMPLETED' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : payment.status === 'PENDING' ? (
                              <Clock className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">€{(payment.amount / 100).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{payment.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}
                            data-testid={`badge-payment-${payment.status.toLowerCase()}`}
                          >
                            {payment.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(payment.createdAt), 'dd MMM yyyy', { locale: nl })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">{t('subscription.payments.noPaymentsTitle')}</h3>
                      <p className="text-muted-foreground">{t('subscription.payments.noPaymentsDesc')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}
