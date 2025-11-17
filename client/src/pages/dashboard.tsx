import { useApp } from "@/providers/AppProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  Building2,
  User,
  Users,
  Shield,
  Calendar,
  Plus,
  Search,
  Mail,
  BarChart3,
  UserPlus,
  Check,
  LogOut,
  FileText,
  Briefcase,
  MessageSquare,
  CreditCard,
  Star,
  TrendingUp
} from "lucide-react";
import { formatDate } from "@/lib/auth";
import { getUserTypeLabel } from "@/lib/i18n-helpers";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguageContext } from "@/context/LanguageContext";
import { SubscriptionProtectedButton } from "@/components/subscription-protected-button";
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

const getQuickActions = (userType: string, t: any) => {
  // Base actions - exclude Payments for BUREAU users
  const baseActions = [
    {
      icon: FileText,
      label: t("jobs.myJobs"),
      color: "bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary",
      href: "/my-jobs",
    },
    {
      icon: BarChart3,
      label: t("navigation.analytics"),
      color: "bg-gradient-to-r from-secondary/10 to-accent/10 hover:from-secondary/20 hover:to-accent/20 text-secondary",
      href: "/analytics",
    },
    ...(userType !== 'BUREAU' ? [{
      icon: CreditCard,
      label: t("navigation.payments"),
      color: "bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 text-accent",
      href: "/payments",
    }] : []),
    {
      icon: Star,
      label: t("navigation.ratings"),
      color: "bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-primary",
      href: "/ratings",
    },
  ];

  if (userType === "BEDRIJF" || userType === "BUREAU") {
    const companyActions = [
      {
        icon: Plus,
        label: t("jobs.createJob"),
        color: "bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary",
        href: "/jobs/new",
      },
      {
        icon: Search,
        label: t("jobs.allJobs"),
        color: "bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary",
        href: "/jobs",
      },
      ...baseActions,
    ];
    
    // Add Quick Reply Templates and Verification only for BEDRIJF users
    if (userType === "BEDRIJF") {
      companyActions.push({
        icon: MessageSquare,
        label: t("templates.quickReplyTemplates"),
        color: "bg-gradient-to-r from-accent/10 to-secondary/10 hover:from-accent/20 hover:to-secondary/20 text-accent",
        href: "/quick-reply-templates",
      });

      companyActions.push({
        icon: Shield,
        label: t("verification.companyVerification"),
        color: "bg-gradient-to-r from-secondary/10 to-accent/10 hover:from-secondary/20 hover:to-accent/20 text-secondary",
        href: "/company-verification",
      });

      // VMS (Vendor Management System) modules - BUG #10-12
      companyActions.push({
        icon: Building2,
        label: "VMS Dashboard",
        color: "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600",
        href: "/vms/company-dashboard",
      });

      // NOTE: Vendor onboarding is automatic when a candidate is hired (status → PLACED)
      // No manual "Onboard New Vendor" button needed - vendors are onboarded via candidate placement workflow

      companyActions.push({
        icon: Users,
        label: "Vendor List",
        color: "bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-600",
        href: "/vms/vendors",
      });
    }

    return companyActions;
  } else {
    return [
      {
        icon: Search,
        label: t("jobs.searchJobs"),
        color: "bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary",
        href: "/jobs",
      },
      {
        icon: Plus,
        label: t("profile.updateProfile"),
        color: "bg-gradient-to-r from-secondary/10 to-accent/10 hover:from-secondary/20 hover:to-accent/20 text-secondary",
        href: "/profile",
      },
      ...baseActions,
    ];
  }
};

export default function Dashboard() {
  const { user, logout } = useApp();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useLanguageContext();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const UserIcon = getUserIcon(user.userType);
  const quickActions = getQuickActions(user.userType, t);

  return (
    <PageWrapper>
      <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-welcome">
              {t("dashboard.welcome", { name: user.name })}
            </h1>
            <div className="mt-1 text-sm text-gray-500">
              Current language: {currentLanguage} | Test: {t("common.login")} | LocalStorage: {localStorage.getItem('i18nextLng')}
            </div>
            <p className="mt-2 text-muted-foreground" data-testid="text-account-type">
              {t("dashboard.accountOverview", { userType: getUserTypeLabel(user.userType, t) })}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={async () => {
              await logout();
              setLocation("/login");
            }}
            data-testid="button-logout-dashboard"
            className="text-red-600 border-red-600 hover:bg-red-50 rounded-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("common.logout")}
          </Button>
        </div>

        {/* Account Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Account Type Card */}
          <Card className="feature-card bg-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="icon-box icon-box-gradient">
                    <UserIcon className="text-white h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">{t("profile.accountType")}</p>
                  <p className="text-lg font-semibold text-foreground" data-testid="text-user-type">
                    {getUserTypeLabel(user.userType, t)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status - Hide for BUREAU users */}
          {user.userType !== 'BUREAU' && (
            <Card className="feature-card bg-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="icon-box bg-gradient-to-r from-secondary to-accent">
                      <Shield className="text-white h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">{t("verification.status")}</p>
                    <p className="text-lg font-semibold text-secondary" data-testid="text-verification-status">
                      {user.isVerified ? t("verification.verified") : t("verification.pending")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Since - Hide for BUREAU users */}
          {user.userType !== 'BUREAU' && (
            <Card className="feature-card bg-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="icon-box bg-gradient-to-r from-primary to-accent">
                      <Calendar className="text-white h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">{t("profile.memberSince")}</p>
                    <p className="text-lg font-semibold text-foreground" data-testid="text-member-since">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              {t("dashboard.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                // Special handling for "Create Job" action to require subscription
                if (action.href === "/jobs/new") {
                  return (
                    <SubscriptionProtectedButton
                      key={index}
                      targetPath={action.href}
                      variant="ghost"
                      className={`flex items-center justify-start p-4 h-auto w-full ${action.color} transition-colors rounded-xl hover:shadow-md`}
                      data-testid={`button-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <action.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{action.label}</span>
                    </SubscriptionProtectedButton>
                  );
                }
                
                // Regular link for other actions
                return (
                  <Link key={index} href={action.href}>
                    <Button
                      variant="ghost"
                      className={`flex items-center justify-start p-4 h-auto w-full ${action.color} transition-colors rounded-xl hover:shadow-md`}
                      data-testid={`button-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <action.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{action.label}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Test Payment Button - Hide for BUREAU users */}
              {user.userType !== 'BUREAU' && (
                <Link href="/checkout">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start p-4 h-auto w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 text-green-700 dark:text-green-300 transition-colors rounded-xl hover:shadow-md"
                    data-testid="button-test-payment"
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    <span className="font-medium">Test Stripe Payment (€25)</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              {t("dashboard.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3" data-testid="activity-account-created">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserPlus className="text-blue-600 dark:text-blue-400 h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{t("dashboard.accountCreated")}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {user.updatedAt && user.updatedAt !== user.createdAt && (
                <div className="flex items-start space-x-3" data-testid="activity-profile-updated">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-green-600 dark:text-green-400 h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Profiel informatie bijgewerkt</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Geen verdere activiteit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageWrapper>
  );
}
