import { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import { useTheme } from "./theme-provider";
import { LanguageSelector } from "./language-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Moon, Sun, User, Settings, LogOut, Home, Search, Plus, FileText, Users, MessageSquare, Bell, BarChart3, Menu, X, Award, TrendingUp, GitBranch, DollarSign, FolderKanban, Shield, Zap, List, Building2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiGet } from "@/lib/api-client";

export function Navigation() {
  const { user, logout } = useApp();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get unread message count for badge
  const { data: unreadData } = useQuery<{ unreadCount: number }>({
    queryKey: ["/api/v2/messages/unread-count"],
    queryFn: async () => {
      const response = await apiGet<{ unreadCount: number }>("/api/v2/messages/unread-count");
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch unread count");
      }
      return response.data;
    },
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const unreadCount = unreadData?.unreadCount || 0;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href={user ? "/dashboard" : "/"}>
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center cursor-pointer hover:text-blue-700 transition-colors">
                  <Briefcase className="mr-2" />
                  TalentMarkt
                </h1>
              </Link>
            </div>
          </div>

          {/* Mobile menu button - ALWAYS visible on small screens */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Public Navigation */}
            <Link href="/jobs">
              <Button 
                variant="ghost" 
                className={`rounded-full text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 ${location === "/jobs" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : ""}`}
                data-testid="link-jobs"
              >
                <Search className="mr-2 h-4 w-4" />
                {t("navigation.jobs")}
              </Button>
            </Link>

            {/* Messages - only for authenticated users */}
            {user && (
              <Link href="/messages">
                <Button 
                  variant="ghost" 
                  className={`relative rounded-full text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 ${location === "/messages" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : ""}`}
                  data-testid="link-messages"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t("navigation.messages")}
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              /* User Menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-600 text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                      {user.email}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 w-fit mt-1">
                      {t(`userTypes.${user.userType}`)}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer" data-testid="link-dashboard">
                      <Home className="mr-2 h-4 w-4" />
                      <span>{t("navigation.dashboard")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="cursor-pointer" data-testid="link-messages-menu">
                      <div className="flex items-center w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>{t("navigation.messages")}</span>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-jobs" className="cursor-pointer" data-testid="link-my-jobs">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{user.userType === 'ZZP' ? t("jobs.myJobs") : t("jobs.myJobs")}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.userType === 'ZZP' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/zzp-profile" className="cursor-pointer" data-testid="link-zzp-profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t("navigation.profile")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-applications" className="cursor-pointer" data-testid="link-my-applications">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{t("applications.myApplications")}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.userType === 'BUREAU' && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("navigation.bureauPortal")}
                        </p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal" className="cursor-pointer" data-testid="link-bureau-portal">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          <span>{t("navigation.portalDashboard")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal/jobs" className="cursor-pointer" data-testid="link-bureau-portal-jobs">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>{t("navigation.availableJobs")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal/submit-candidate" className="cursor-pointer" data-testid="link-bureau-portal-submit">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{t("navigation.submitCandidate")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal/performance" className="cursor-pointer" data-testid="link-bureau-portal-performance">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>{t("navigation.performanceAnalytics")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal/contracts" className="cursor-pointer" data-testid="link-bureau-portal-contracts">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{t("navigation.myContracts")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal/rates" className="cursor-pointer" data-testid="link-bureau-portal-rates">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>{t("navigation.rateCards")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("navigation.vmsPhase3")}
                        </p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal/messages" className="cursor-pointer" data-testid="link-bureau-messages">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>{t("navigation.bureauMessages")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bureau-portal/shortlists" className="cursor-pointer" data-testid="link-bureau-shortlists">
                          <List className="mr-2 h-4 w-4" />
                          <span>{t("navigation.myShortlists")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("navigation.vmsLegacy")}
                        </p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/vms/bureau-dashboard" className="cursor-pointer" data-testid="link-vms-bureau-dashboard">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          <span>{t("navigation.bureauDashboard")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/vms/bureau-rankings" className="cursor-pointer" data-testid="link-vms-rankings">
                          <Award className="mr-2 h-4 w-4" />
                          <span>{t("navigation.bureauRankings")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/workflows" className="cursor-pointer" data-testid="link-workflows-bureau">
                          <GitBranch className="mr-2 h-4 w-4" />
                          <span>{t("navigation.workflows")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user.userType === 'BEDRIJF' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/vms/company-dashboard" className="cursor-pointer" data-testid="link-vms-company-dashboard">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{t("navigation.bureauManagement")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/vms/bureau-rankings" className="cursor-pointer" data-testid="link-vms-rankings">
                          <Award className="mr-2 h-4 w-4" />
                          <span>{t("navigation.bureauRankings")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/analytics" className="cursor-pointer" data-testid="link-analytics">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>{t("navigation.advancedAnalytics")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/workflows" className="cursor-pointer" data-testid="link-workflows">
                          <GitBranch className="mr-2 h-4 w-4" />
                          <span>{t("navigation.workflowAutomation")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/contracts" className="cursor-pointer" data-testid="link-contracts">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{t("navigation.contractManagement")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          VMS Phase 3
                        </p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/contracts/templates" className="cursor-pointer" data-testid="link-contract-templates">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{t("navigation.contractTemplates")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/contracts/msa" className="cursor-pointer" data-testid="link-msa">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>{t("navigation.msaManagement")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bulk-actions" className="cursor-pointer" data-testid="link-bulk-actions">
                          <Zap className="mr-2 h-4 w-4" />
                          <span>{t("navigation.bulkActions")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/compliance" className="cursor-pointer" data-testid="link-compliance">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>{t("navigation.complianceDashboard")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {(user.userType === 'BEDRIJF' || user.userType === 'BUREAU') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="cursor-pointer" data-testid="link-account">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t('account.title')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant" className="cursor-pointer" data-testid="link-organization-settings">
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{t('tenant.organizationDashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/jobs/new" className="cursor-pointer" data-testid="link-new-job">
                          <Plus className="mr-2 h-4 w-4" />
                          <span>{t("jobs.createJob")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/manage-applications" className="cursor-pointer" data-testid="link-manage-applications">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{t("applications.manageApplications")}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer" data-testid="link-profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("navigation.profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="cursor-pointer" data-testid="link-notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>{t("navigation.notifications")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/job-alert-preferences" className="cursor-pointer" data-testid="link-job-alerts">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>{t("navigation.jobAlerts")}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/analytics" className="cursor-pointer" data-testid="link-analytics">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Analytics Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/reminders" className="cursor-pointer" data-testid="link-email-reminders">
                          <Bell className="mr-2 h-4 w-4" />
                          <span>Email Reminders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/email-demo" className="cursor-pointer" data-testid="link-email-demo">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Email Demo</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("common.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Auth Navigation */
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className={`rounded-full text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 ${location === "/login" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : ""}`}
                    data-testid="link-login"
                  >
                    {t("common.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className={`rounded-full bg-blue-600 hover:bg-blue-700 text-white ${location === "/register" ? "bg-blue-700" : ""}`}
                    data-testid="link-register"
                  >
                    {t("common.register")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 space-y-2">
            <Link href="/jobs">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="mr-2 h-4 w-4" />
                {t("navigation.jobs")}
              </Button>
            </Link>

            {user ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    {t("navigation.dashboard")}
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start relative"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t("navigation.messages")}
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/my-jobs">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {user.userType === 'ZZP' ? t("jobs.myJobs") : t("jobs.myJobs")}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t("navigation.profile")}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 dark:text-red-400"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("common.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("common.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("common.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
