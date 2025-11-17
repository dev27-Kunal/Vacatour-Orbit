import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Subscription, UsageStatistics, PaymentMethod, SubscriptionPlan } from "@/types/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Star, 
  Crown, 
  Zap, 
  Settings,
  Download,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle
} from "lucide-react";
import { I18nFormatters } from "@/lib/i18n-formatters";
import { PaymentHistory } from "@/components/subscription/PaymentHistory";
import { PlanComparison } from "@/components/subscription/PlanComparison";
import { CancellationFlow } from "@/components/subscription/CancellationFlow";
import { PaymentMethodUpdate } from "@/components/subscription/PaymentMethodUpdate";
import { PageWrapper } from "@/components/page-wrapper";
import { apiGet } from "@/lib/api-client";

// Note: This data would ideally come from the API, but keeping it here for now
// Plans will use translation keys for features
const getSubscriptionPlans = (t: any): SubscriptionPlan[] => [
  {
    id: 'STARTER',
    name: t('subscription.plans.starter.name'),
    price: 2900, // €29.00
    interval: 'maand',
    features: t('subscription.plans.starter.features', { returnObjects: true }),
    icon: Star,
    popular: false,
    jobLimit: 10,
    applicantLimit: 100,
  },
  {
    id: 'PROFESSIONAL',
    name: t('subscription.plans.professional.name'),
    price: 9900, // €99.00
    interval: 'maand',
    features: t('subscription.plans.professional.features', { returnObjects: true }),
    icon: Crown,
    popular: true,
    jobLimit: 50,
    applicantLimit: 500,
  },
  {
    id: 'ENTERPRISE',
    name: t('subscription.plans.enterprise.name'),
    price: 29900, // €299.00
    interval: 'maand',
    features: t('subscription.plans.enterprise.features', { returnObjects: true }),
    icon: Zap,
    popular: false,
    jobLimit: -1, // Unlimited
    applicantLimit: -1, // Unlimited
  },
];

export default function SubscriptionDashboard() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancellation, setShowCancellation] = useState(false);
  const [showPaymentUpdate, setShowPaymentUpdate] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create formatters for current locale
  const formatters = new I18nFormatters(i18n.language);
  const SUBSCRIPTION_PLANS = getSubscriptionPlans(t);

  // Get current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscription"],
    queryFn: async () => {
      const response = await apiGet<Subscription>("/api/subscription");
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch subscription');
      }
      return response.data;
    },
  });

  // Get usage statistics
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["/api/subscription/usage"],
    queryFn: async () => {
      const response = await apiGet<UsageStatistics>("/api/subscription/usage");
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch usage');
      }
      return response.data;
    },
  });

  // Get payment method
  const { data: paymentMethod, isLoading: paymentMethodLoading } = useQuery({
    queryKey: ["/api/subscription/payment-method"],
    queryFn: async () => {
      const response = await apiGet<PaymentMethod>("/api/subscription/payment-method");
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment method');
      }
      return response.data;
    },
  });

  const isLoading = subscriptionLoading || usageLoading || paymentMethodLoading;
  
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === subscription?.plan) || SUBSCRIPTION_PLANS[0];
  const jobsUsagePercentage = currentPlan.jobLimit === -1 ? 0 : 
    Math.min((usage?.jobsPosted || 0) / currentPlan.jobLimit * 100, 100);
  const applicationsUsagePercentage = currentPlan.applicantLimit === -1 ? 0 :
    Math.min((usage?.applicationsReceived || 0) / currentPlan.applicantLimit * 100, 100);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('subscription.dashboard.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('subscription.dashboard.subtitle')}</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => setShowPaymentUpdate(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {t('subscription.dashboard.paymentSettings')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancellation(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <AlertTriangle className="h-4 w-4" />
              {t('subscription.dashboard.cancel')}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('subscription.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="usage">{t('subscription.tabs.usage')}</TabsTrigger>
            <TabsTrigger value="payments">{t('subscription.tabs.payments')}</TabsTrigger>
            <TabsTrigger value="plans">{t('subscription.tabs.plans')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Subscription Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <currentPlan.icon className="h-5 w-5" />
                    {t('subscription.dashboard.currentSubscription')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{currentPlan.name}</h3>
                        <Badge 
                          variant={subscription?.status === 'ACTIVE' ? 'default' : 
                                  subscription?.status === 'TRIALING' ? 'secondary' : 'destructive'}
                          className="mt-1"
                        >
                          {t(`subscription.dashboard.status.${subscription?.status}`) || t('subscription.dashboard.status.TRIALING')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatters.formatCurrency(currentPlan.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('common.per')} {t(`subscription.plans.interval.${currentPlan.interval}`)}</div>
                      </div>
                    </div>

                    {subscription?.currentPeriodEnd && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">{t('subscription.dashboard.nextBilling')}</p>
                            <p className="text-blue-700 text-sm">
                              {formatters.formatDate(subscription.currentPeriodEnd)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Card */}
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('subscription.dashboard.paymentMethod')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentMethod ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CreditCard className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{formatters.formatCardNumber(paymentMethod.last4, paymentMethod.brand)}</p>
                          <p className="text-sm text-gray-600">
                            {paymentMethod.brand?.toUpperCase()} • {t('subscription.dashboard.expires')} {formatters.formatCardExpiry(paymentMethod.expMonth, paymentMethod.expYear)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPaymentUpdate(true)}
                        className="w-full"
                      >
                        {t('subscription.dashboard.updatePaymentMethod')}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">{t('subscription.dashboard.noPaymentMethod')}</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowPaymentUpdate(true)}
                      >
                        {t('subscription.dashboard.addPaymentMethod')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="feature-card bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatters.formatNumber(usage?.jobsPosted || 0)}</p>
                      <p className="text-sm text-gray-600">
                        {currentPlan.jobLimit === -1 
                          ? t('subscription.usage.jobsPosted') 
                          : t('subscription.usage.allowedJobs', { limit: currentPlan.jobLimit })
                        }
                      </p>
                    </div>
                  </div>
                  {currentPlan.jobLimit !== -1 && (
                    <Progress value={jobsUsagePercentage} className="mt-3" />
                  )}
                </CardContent>
              </Card>

              <Card className="feature-card bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatters.formatNumber(usage?.applicationsReceived || 0)}</p>
                      <p className="text-sm text-gray-600">{t('subscription.usage.applicationsReceived')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatters.formatNumber(usage?.viewsThisMonth || 0)}</p>
                      <p className="text-sm text-gray-600">{t('subscription.usage.viewsThisMonth')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatters.formatNumber(usage?.responsesThisMonth || 0)}</p>
                      <p className="text-sm text-gray-600">{t('subscription.usage.responsesThisMonth')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Alerts */}
            {jobsUsagePercentage >= 80 && currentPlan.jobLimit !== -1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800">{t('subscription.usage.limitReached')}</h4>
                    <p className="text-yellow-700 text-sm">
                      {t('subscription.usage.limitWarning', { percentage: Math.round(jobsUsagePercentage) })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('plans')}>
                    {t('subscription.alerts.upgradePrompt')}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Jobs Usage */}
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('subscription.usage.jobsUsage')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{formatters.formatNumber(usage?.jobsPosted || 0)}</p>
                        <p className="text-sm text-gray-600">
                          {currentPlan.jobLimit === -1 
                            ? t('subscription.usage.unlimitedJobs')
                            : t('subscription.usage.allowedJobs', { limit: currentPlan.jobLimit })
                          }
                        </p>
                      </div>
                      {currentPlan.jobLimit !== -1 && (
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">
                            {formatters.formatPercentage(jobsUsagePercentage)}%
                          </p>
                        </div>
                      )}
                    </div>
                    {currentPlan.jobLimit !== -1 && (
                      <Progress value={jobsUsagePercentage} className="h-2" />
                    )}
                    <div className="text-sm text-gray-600">
                      <p>{t('subscription.usage.thisMonth')}: {formatters.formatNumber(usage?.jobsThisMonth || 0)}</p>
                      <p>{t('subscription.usage.activeJobs')}: {formatters.formatNumber(usage?.activeJobs || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications Usage */}
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('subscription.usage.applicationsAnalysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{formatters.formatNumber(usage?.applicationsReceived || 0)}</p>
                        <p className="text-sm text-gray-600">{t('subscription.usage.totalReceived')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{formatters.formatNumber(usage?.applicationsThisMonth || 0)}</p>
                        <p className="text-gray-600">{t('subscription.usage.thisMonth')}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatters.formatNumber(usage?.averageApplicationsPerJob || 0)}</p>
                        <p className="text-gray-600">{t('subscription.usage.averagePerJob')}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatters.formatPercentage(usage?.responseRate || 0)}%</p>
                        <p className="text-gray-600">{t('subscription.usage.responseRate')}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatters.formatNumber(usage?.hiredCandidates || 0)}</p>
                        <p className="text-gray-600">{t('subscription.usage.hiredCandidates')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage History Chart */}
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle>{t('subscription.usage.usageHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>{t('subscription.usage.chartPlaceholder')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentHistory />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <PlanComparison currentPlan={currentPlan.id} />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CancellationFlow
          isOpen={showCancellation}
          onClose={() => setShowCancellation(false)}
          currentPlan={currentPlan}
          subscription={subscription || null}
        />

        <PaymentMethodUpdate
          isOpen={showPaymentUpdate}
          onClose={() => setShowPaymentUpdate(false)}
          currentPaymentMethod={paymentMethod}
        />
        </div>
      </div>
    </PageWrapper>
  );
}