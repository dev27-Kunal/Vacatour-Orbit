import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Eye, Send, FileText, TrendingUp, Star, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { apiGet } from "@/lib/api-client";

// Import recharts components directly 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { PageWrapper } from "@/components/page-wrapper";

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Get user engagement data (available to authenticated users)
  const { data: engagementData, isLoading: engagementLoading, error: engagementError } = useQuery({
    queryKey: ["/api/analytics/user-engagement", selectedPeriod],
    queryFn: async () => {
      const response = await apiGet<{
        engagement: { views: number; applications: number; messages: number };
        recentEvents: Array<{ event: string; createdAt: string; properties?: string }>;
      }>("/api/analytics/user-engagement");

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch engagement data");
      }

      return response.data;
    },
    retry: 1,
  });

  // Get user's job metrics if they have any
  const { data: jobMetrics, isLoading: jobMetricsLoading } = useQuery({
    queryKey: ["/api/user/jobs"],
    queryFn: async () => {
      const response = await apiGet<{ jobs: Array<any> }>("/api/user/jobs");

      if (!response.success) {
        return { jobs: [] }; // Return empty if no jobs or error
      }

      return response.data;
    },
    retry: 1,
  });

  // Simple subscription check
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscription"],
    queryFn: async () => {
      try {
        const response = await apiGet<{
          plan: string;
          status: string;
          nextBillingDate?: string;
          cancelAtPeriodEnd?: boolean;
        }>("/api/subscription");

        if (!response.success) {
          return { plan: 'FREE', status: 'INACTIVE' };
        }

        return response.data;
      } catch (error) {
        return { plan: 'FREE', status: 'INACTIVE' };
      }
    },
    retry: 1,
  });

  // Payment history
  const { data: paymentData, isLoading: paymentLoading } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      try {
        const response = await apiGet<{
          payments: Array<{
            id: string;
            amount: number;
            status: string;
            description: string;
            createdAt: string;
          }>;
        }>("/api/payments");

        if (!response.success) {
          return { payments: [] };
        }

        return response.data;
      } catch (error) {
        return { payments: [] };
      }
    },
    retry: 1,
  });

  const isLoading = engagementLoading || jobMetricsLoading || subscriptionLoading || paymentLoading;
  const payments = paymentData?.payments || [];

  if (isLoading) {
    return (
    <PageWrapper>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t('analytics.title')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card className="feature-card bg-card animate-pulse" key={i}>
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

  // Handle errors
  if (engagementError) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">{t('analyticsPage.notAvailable')}</h1>
              <p className="text-gray-600 mb-4">
                {engagementError.message.includes('401') || engagementError.message.includes('403') 
                  ? t('analyticsPage.loginRequired')
                  : t('analyticsPage.loadError')}
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Extract data with defaults
  const engagement = engagementData?.engagement || { views: 0, applications: 0, messages: 0 };
  const userJobs = jobMetrics?.jobs || [];
  const subscription = subscriptionData || { plan: 'FREE', status: 'INACTIVE' };
  
  // Mock data for features that aren't implemented yet
  const averageRating = 4.5;
  const ratings = [
    { rating: 5, comment: "Excellent service!", user: "Anonymous", createdAt: new Date().toISOString() },
    { rating: 4, comment: "Very helpful", user: "Anonymous", createdAt: new Date().toISOString() },
  ];
  const totalPayments = 0;
  const successfulPayments = 0;
  
  // Create mock chart data based on available data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: format(date, 'dd/MM', { locale: nl }),
      view_job: Math.floor(Math.random() * 20) + engagement.views / 7, // Simple distribution
      apply_job: Math.floor(Math.random() * 5) + engagement.applications / 7,
      send_message: Math.floor(Math.random() * 3) + engagement.messages / 7,
    };
  });


  return (
    <PageWrapper>
      <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
          <div className="flex gap-2">
            {["7", "30", "90"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                data-testid={`button-period-${period}`}
              >
                {period} {t('analyticsPage.days')}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="feature-card bg-card" data-testid="card-views">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('analyticsPage.labels.views')}</p>
                  <p className="text-2xl font-bold text-gray-900">{engagement.views || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card bg-card" data-testid="card-applications">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('analyticsPage.labels.applications')}</p>
                  <p className="text-2xl font-bold text-gray-900">{engagement.applications || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card bg-card" data-testid="card-messages">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('analyticsPage.labels.messages')}</p>
                  <p className="text-2xl font-bold text-gray-900">{engagement.messages || 0}</p>
                </div>
                <Send className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card bg-card" data-testid="card-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('analyticsPage.labels.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating.toFixed(1)} <span className="text-sm text-gray-500">/ 5.0</span>
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" data-testid="tab-analytics">{t('analyticsPage.tabs.analytics')}</TabsTrigger>
            <TabsTrigger value="ratings" data-testid="tab-ratings">{t('analyticsPage.tabs.ratings')}</TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">{t('analyticsPage.tabs.payments')}</TabsTrigger>
            <TabsTrigger value="subscription" data-testid="tab-subscription">{t('analyticsPage.tabs.subscription')}</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="feature-card bg-card" data-testid="card-analytics-chart">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                  {t('analyticsPage.labels.activityOverview')}
                  </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-[300px] flex items-center justify-center">{t('analyticsPage.loadingCharts')}</div>}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="view_job" fill="#3b82f6" name={t('analyticsPage.labels.views')} />
                      <Bar dataKey="apply_job" fill="#10b981" name={t('analyticsPage.labels.applications')} />
                      <Bar dataKey="send_message" fill="#8b5cf6" name={t('analyticsPage.labels.messages')} />
                  </BarChart>
                </ResponsiveContainer>
              </Suspense>
            </CardContent>
          </Card>

            <Card className="feature-card bg-card" data-testid="card-recent-events">
              <CardHeader>
                <CardTitle>{t('analyticsPage.labels.recentActivities')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(engagementData?.recentEvents || []).slice(0, 10).map((event: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{event.event}</Badge>
                        <span className="text-sm text-gray-600">
                          {format(new Date(event.createdAt), 'dd MMM yyyy HH:mm', { locale: nl })}
                        </span>
                      </div>
                      {event.properties && (
                        <span className="text-xs text-gray-500">
                          {JSON.parse(event.properties).duration || ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="feature-card bg-card" data-testid="card-rating-summary">
                <CardHeader>
                  <CardTitle>Beoordelingen Overzicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{t('analyticsPage.labels.basedOnRatings', { count: ratings.length })}</p>
                </div>
              </CardContent>
            </Card>

              <Card className="feature-card bg-card" data-testid="card-recent-ratings">
                <CardHeader>
                  <CardTitle>Recente Beoordelingen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ratings.slice(0, 5).map((rating: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < rating.score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{rating.fromUser.name}</span>
                          </div>
                          {rating.comment && (
                            <p className="text-sm text-gray-600">{rating.comment}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(rating.createdAt), 'dd MMM', { locale: nl })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="feature-card bg-card" data-testid="card-total-payments">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Totaal Betalingen</p>
                      <p className="text-2xl font-bold text-gray-900">€{(totalPayments / 100).toFixed(2)}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card bg-card" data-testid="card-successful-payments">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Geslaagde Betalingen</p>
                      <p className="text-2xl font-bold text-gray-900">{successfulPayments}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card bg-card" data-testid="card-payment-rate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Slagingspercentage</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {payments.length > 0 ? Math.round((successfulPayments / payments.length) * 100) : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="feature-card bg-card" data-testid="card-payment-history">
              <CardHeader>
                <CardTitle>Betalingsgeschiedenis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}
                          data-testid={`badge-payment-${payment.status.toLowerCase()}`}
                        >
                          {payment.status}
                        </Badge>
                        <span className="font-medium">€{(payment.amount / 100).toFixed(2)}</span>
                        <span className="text-sm text-gray-600">{payment.description}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(payment.createdAt), 'dd MMM yyyy', { locale: nl })}
                      </span>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nog geen betalingen gevonden
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card className="feature-card bg-card" data-testid="card-subscription-info">
              <CardHeader>
                <CardTitle>Huidige Abonnement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{subscription.plan} Plan</h3>
                    <Badge 
                      variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}
                      data-testid={`badge-subscription-${subscription.status.toLowerCase()}`}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  {subscription.nextBillingDate && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Volgende betaling</p>
                      <p className="font-medium">
                        {format(new Date(subscription.nextBillingDate), 'dd MMM yyyy', { locale: nl })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">Plan Voordelen</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {subscription.plan === 'STARTER' && (
                        <>
                          <li>• Tot 5 vacatures per maand</li>
                          <li>• Basis analytics</li>
                          <li>• Email support</li>
                        </>
                      )}
                      {subscription.plan === 'PROFESSIONAL' && (
                        <>
                          <li>• Onbeperkte vacatures</li>
                          <li>• Geavanceerde analytics</li>
                          <li>• Prioriteit support</li>
                          <li>• CV database toegang</li>
                        </>
                      )}
                      {subscription.plan === 'ENTERPRISE' && (
                        <>
                          <li>• Alle Professional voordelen</li>
                          <li>• White-label opties</li>
                          <li>• API toegang</li>
                          <li>• Persoonlijke account manager</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">Gebruik Deze Maand</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Vacatures gepost:</span>
                        <span className="font-medium">{userJobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Analytics events:</span>
                        <span className="font-medium">{engagement.views + engagement.applications + engagement.messages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Berichten verstuurd:</span>
                        <span className="font-medium">{engagement.messages || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Je abonnement wordt opgezegd aan het einde van de huidige periode.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}
