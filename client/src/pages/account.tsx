import { useApp } from "@/providers/AppProvider";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building, 
  Users, 
  Shield, 
  Calendar, 
  CreditCard,
  Crown,
  Mail,
  Phone,
  MapPin,
  Edit,
  Star,
  CheckCircle
} from "lucide-react";
import { formatDate } from "@/lib/auth";
import { getUserTypeLabel } from "@/lib/i18n-helpers";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/page-wrapper";

const getUserIcon = (userType: string) => {
  switch (userType) {
    case "BEDRIJF":
      return Building;
    case "ZZP":
      return User;
    case "BUREAU":
      return Users;
    default:
      return User;
  }
};

const getSubscriptionInfo = (userType: string, t: any) => {
  // In a real app, this would come from the database
  // For now, we'll show different plans based on user type
  switch (userType) {
    case "BEDRIJF":
      return {
        plan: "Professional",
        status: "active",
        price: "€49/maand",
        nextBilling: "2025-09-18",
        features: [
          t('account.features.unlimitedJobs'),
          t('account.features.premiumMatching'),
          t('account.features.companyVerification'),
          t('account.features.analyticsDashboard'),
          t('account.features.prioritySupport'),
          t('account.features.apiAccess')
        ]
      };
    case "ZZP":
      return {
        plan: "Freelancer",
        status: "active", 
        price: "€19/maand",
        nextBilling: "2025-09-18",
        features: [
          t('account.features.allJobsAccess'),
          t('account.features.cvManagement'),
          t('account.features.directMessages'),
          t('account.features.profileBoost'),
          t('account.features.emailNotifications')
        ]
      };
    case "BUREAU":
      return {
        plan: "Enterprise",
        status: "active",
        price: "€99/maand", 
        nextBilling: "2025-09-18",
        features: [
          t('account.features.unlimitedClientJobs'),
          t('account.features.teamManagement'),
          t('account.features.advancedAnalytics'),
          t('account.features.whiteLabelOption'),
          t('account.features.dedicatedAccountManager'),
          t('account.features.slaGuarantee')
        ]
      };
    default:
      return {
        plan: "Gratis",
        status: "active",
        price: "€0/maand",
        nextBilling: null,
        features: [t('account.features.basicAccess')]
      };
  }
};

export default function AccountPage() {
  const { user } = useApp();
  const { t } = useTranslation();

  if (!user) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </PageWrapper>
    );
  }

  const UserIcon = getUserIcon(user.userType);
  const subscription = getSubscriptionInfo(user.userType, t);

  return (
    <PageWrapper>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t('account.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('account.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('account.accountInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="text-primary h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {user.name}
                    </h3>
                    {user.companyName && (
                      <p className="text-muted-foreground">
                        {user.companyName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {getUserTypeLabel(user.userType, t)}
                      </Badge>
                      {user.isVerified && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('account.verified')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      {t('account.edit')}
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{t('account.email')}</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{t('account.memberSince')}</p>
                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{t('account.verificationStatus')}</p>
                        <p className="font-medium">
                          {user.isVerified ? t('account.verified') : t('account.pending')}
                        </p>
                      </div>
                    </div>

                    {user.averageRating && (
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t('account.averageRating')}</p>
                          <p className="font-medium">
                            {user.averageRating.toFixed(1)} ⭐ ({user.totalRatings} reviews)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Features */}
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t('account.yourFeatures')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Info */}
          <div className="space-y-6">
            {/* Current Plan */}
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  {t('account.currentPlan')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 ">
                    {subscription.plan}
                  </h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">
                    {subscription.price}
                  </p>
                  <Badge 
                    variant={subscription.status === 'active' ? 'default' : 'destructive'}
                    className="mt-2"
                  >
                    {subscription.status === 'active' ? t('account.active') : t('account.inactive')}
                  </Badge>
                </div>

                {subscription.nextBilling && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">{t('account.nextBilling')}</p>
                    <p className="font-medium">{formatDate(subscription.nextBilling)}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Link href="/checkout">
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t('account.upgradeSubscription')}
                    </Button>
                  </Link>
                  
                  <Link href="/payments">
                    <Button variant="outline" className="w-full">
                      {t('account.paymentHistory')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle>{t('account.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/company-verification">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    {t('account.companyVerification')}
                  </Button>
                </Link>
                
                <Link href="/notification-preferences">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    {t('account.notificationSettings')}
                  </Button>
                </Link>
                
                <Link href="/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    {t('account.analyticsReports')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </PageWrapper>
  );
}