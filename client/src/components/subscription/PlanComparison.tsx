import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import type { SubscriptionPlan, ProrationPreview } from "@/types/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Star, 
  Crown, 
  Zap,
  ArrowUp,
  ArrowDown,
  Calculator,
  CreditCard,
  AlertCircle,
  Loader2,
  Calendar
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { I18nFormatters } from "@/lib/i18n-formatters";
import { apiGet, apiPost } from "@/lib/api-client";

// Move plans to be created with translations
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

interface PlanComparisonProps {
  currentPlan: string;
}


export function PlanComparison({ currentPlan }: PlanComparisonProps) {
  const { t, i18n } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [prorationPreview, setProrationPreview] = useState<ProrationPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create formatters and plans with current locale
  const formatters = new I18nFormatters(i18n.language);
  const SUBSCRIPTION_PLANS = getSubscriptionPlans(t);

  // Get proration preview
  const getProrationPreview = async (planId: string) => {
    setLoadingPreview(true);
    try {
      const response = await apiGet<ProrationPreview>('/api/subscription/preview', { planId });
      if (!response.success) {throw new Error('Failed to get proration preview');}
      setProrationPreview(response.data!);
      setSelectedPlan(planId);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('subscription.planComparison.error'),
        variant: "destructive",
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  // Change subscription plan
  const changePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiPost("/api/subscription/change-plan", { planId });

      if (!response.success) {
        throw new Error(response.error || "Failed to change plan");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      setShowPreview(false);
      setProrationPreview(null);
      setSelectedPlan('');
      
      toast({
        title: t('subscription.planComparison.success'),
        description: t('subscription.planComparison.successMessage'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('subscription.planComparison.errorMessage'),
        variant: "destructive",
      });
    },
  });

  const currentPlanData = SUBSCRIPTION_PLANS.find(p => p.id === currentPlan);
  
  const isUpgrade = (planId: string) => {
    const currentPrice = currentPlanData?.price || 0;
    const newPrice = SUBSCRIPTION_PLANS.find(p => p.id === planId)?.price || 0;
    return newPrice > currentPrice;
  };

  const isDowngrade = (planId: string) => {
    const currentPrice = currentPlanData?.price || 0;
    const newPrice = SUBSCRIPTION_PLANS.find(p => p.id === planId)?.price || 0;
    return newPrice < currentPrice;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('subscription.planComparison.title')}</h2>
          <p className="text-gray-600">{t('subscription.planComparison.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            const isUpgradeOption = isUpgrade(plan.id);
            const isDowngradeOption = isDowngrade(plan.id);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''
                } ${isCurrentPlan ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">{t('subscription.plans.popular')}</Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white px-3 py-1">{t('subscription.planComparison.currentPlan')}</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-xl ${
                      plan.popular ? 'bg-blue-100' : 
                      isCurrentPlan ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-8 w-8 ${
                        plan.popular ? 'text-blue-600' : 
                        isCurrentPlan ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatters.formatCurrency(plan.price)}
                    </div>
                    <div className="text-sm text-gray-600">{t('common.per')} {t(`subscription.plans.interval.${plan.interval}`)}</div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-3">
                    {isCurrentPlan ? (
                      <Button className="w-full" disabled>
                        {t('subscription.plans.current')}
                      </Button>
                    ) : (
                      <Button
                        className={`w-full transition-all duration-200 ${
                          isUpgradeOption 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : isDowngradeOption 
                              ? 'bg-orange-600 hover:bg-orange-700' 
                              : plan.popular 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                        onClick={() => getProrationPreview(plan.id)}
                        disabled={loadingPreview}
                      >
                        {loadingPreview && selectedPlan === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : isUpgradeOption ? (
                          <ArrowUp className="h-4 w-4 mr-2" />
                        ) : isDowngradeOption ? (
                          <ArrowDown className="h-4 w-4 mr-2" />
                        ) : null}
                        
                        {isUpgradeOption ? t('subscription.plans.upgrade') : 
                         isDowngradeOption ? t('subscription.plans.downgrade') : t('subscription.plans.choosePlan')}
                      </Button>
                    )}
                    
                    {(isUpgradeOption || isDowngradeOption) && (
                      <div className="text-xs text-center text-gray-600">
                        {isUpgradeOption && (
                          <span className="flex items-center justify-center gap-1 text-green-600">
                            <ArrowUp className="h-3 w-3" />
                            {t('subscription.planComparison.immediateAccess')}
                          </span>
                        )}
                        {isDowngradeOption && (
                          <span className="flex items-center justify-center gap-1 text-orange-600">
                            <ArrowDown className="h-3 w-3" />
                            {t('subscription.planComparison.changeInEffect', { date: formatters.formatDate(new Date()) })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('subscription.planComparison.detailedComparison')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t('common.feature')}</th>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <th key={plan.id} className={`text-center py-3 px-4 font-medium ${
                        plan.id === currentPlan ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {plan.name}
                        {plan.id === currentPlan && <Badge className="ml-2 text-xs">{t('subscription.plans.current')}</Badge>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Vacatures per maand</td>
                    <td className="text-center py-3 px-4">10</td>
                    <td className="text-center py-3 px-4">50</td>
                    <td className="text-center py-3 px-4">Onbeperkt</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Applicant beheer</td>
                    <td className="text-center py-3 px-4">Basis</td>
                    <td className="text-center py-3 px-4">Geavanceerd</td>
                    <td className="text-center py-3 px-4">Enterprise</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">CV database</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">API toegang</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Support niveau</td>
                    <td className="text-center py-3 px-4">Email</td>
                    <td className="text-center py-3 px-4">Prioriteit</td>
                    <td className="text-center py-3 px-4">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proration Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t('subscription.planComparison.prorationPreview')}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && prorationPreview && (
                <>
                  {t('subscription.planComparison.changeTo')} {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {prorationPreview && (
            <div className="space-y-4">
              {/* Cost Breakdown */}
              <div className="bg-background p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">{t('subscription.planComparison.costBreakdown')}</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('subscription.planComparison.creditUsed')}:</span>
                    <span className="text-green-600 font-medium">
                      {formatters.formatCurrency(prorationPreview.currentPlanRemainingValue)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('subscription.planComparison.newPlanCost')}:</span>
                    <span className="text-gray-900 font-medium">
                      {formatters.formatCurrency(prorationPreview.newPlanCost)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{t('subscription.planComparison.immediateCharge')}:</span>
                      <span className={`font-bold ${
                        prorationPreview.immediateCharge > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {prorationPreview.immediateCharge > 0 ? '+' : ''}{formatters.formatCurrency(prorationPreview.immediateCharge)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900">{t('subscription.planComparison.nextBillingAmount')}</h4>
                </div>
                <p className="text-blue-800 text-sm">
                  {formatters.formatDate(prorationPreview.nextBillingDate)}
                </p>
                <p className="text-blue-900 font-semibold">
                  {formatters.formatCurrency(prorationPreview.nextBillingAmount)} {t('common.per')} {t('subscription.plans.interval.month')}
                </p>
              </div>

              {/* Important Notes */}
              {isDowngrade(selectedPlan) && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900 text-sm">{t('subscription.planComparison.downgradeWarning')}</h4>
                      <p className="text-orange-800 text-sm mt-1">
                        {t('subscription.planComparison.downgradeWarningMessage')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => changePlanMutation.mutate(selectedPlan)}
                  disabled={changePlanMutation.isPending}
                  className={`flex-1 ${
                    isUpgrade(selectedPlan) 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {changePlanMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t('subscription.planComparison.processing')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t('subscription.planComparison.confirmChange')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}