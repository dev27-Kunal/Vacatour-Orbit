import React, { lazy } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/providers/AppProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navigation } from "@/components/navigation";
import { SkipNavigation } from "@/components/SkipNavigation";
import { LanguageProvider } from "@/context/LanguageContext";
import {
  ProtectedLazyRoute,
  AdminLazyRoute,
  PublicLazyRoute,
} from "@/components/route-wrappers";

// Critical pages loaded immediately
import TalentMarktLanding from "@/pages/talentmarkt-landing";
import NewHomepage from "@/pages/new-homepage";
import NotFound from "@/pages/not-found";
import NewLandingpage from "./pages/new-Landing-Page";

// Authentication pages - can be lazy loaded with proper wrappers
const Register = lazy(() => import("@/pages/register"));
const Login = lazy(() => import("@/pages/login"));
const ConfirmEmail = lazy(() => import("@/pages/confirm-email"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));

// Core user pages - medium priority  
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Profile = lazy(() => import("@/pages/profile"));
const AccountPage = lazy(() => import("@/pages/account"));

// Job-related pages - high usage
const JobsPage = lazy(() => import("@/pages/jobs"));
const JobDetailPage = lazy(() => import("@/pages/job-detail"));
const MyJobsPage = lazy(() => import("@/pages/my-jobs"));
const JobFormPage = lazy(() => import("@/pages/job-form"));

// Application management - medium usage
const MyApplicationsPage = lazy(() => import("@/pages/my-applications"));
const ManageApplicationsPage = lazy(() => import("@/pages/manage-applications"));

// Communication features - medium usage
const MessagesPage = lazy(() => import("@/pages/messages"));
const MessageThreadPage = lazy(() => import("@/pages/message-thread"));
const GuestChatPage = lazy(() => import("@/pages/guest-chat"));

// ZZP Profile features - lower usage
const ZzpProfilePage = lazy(() => import("@/pages/zzp-profile"));
const PublicZzpProfilePage = lazy(() => import("@/pages/public-zzp-profile"));

// Subscription features - medium usage
const Subscribe = lazy(() => import("@/pages/subscribe"));
const SubscriptionDashboard = lazy(() => import("@/pages/subscription-dashboard"));

// Settings and preferences - lower usage
const NotificationPreferencesPage = lazy(() => import("@/pages/notification-preferences"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const JobAlertPreferencesPage = lazy(() => import("@/pages/JobAlertPreferences"));
const JobAlertsPage = lazy(() => import("@/pages/job-alerts"));
const EmailRemindersPage = lazy(() => import("@/pages/email-reminders"));

// Company-specific features - lower usage
const QuickReplyTemplatesPage = lazy(() => import("@/pages/quick-reply-templates"));
const CompanyVerificationPage = lazy(() => import("@/pages/company-verification"));

// Analytics and business features - lower usage
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const PaymentsPage = lazy(() => import("@/pages/payments"));
const RatingsPage = lazy(() => import("@/pages/ratings"));

// Payment flow - medium usage
const Checkout = lazy(() => import("@/pages/checkout"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));

// Admin features - very low usage
const EmailDemoPage = lazy(() => import("@/pages/email-demo"));
const AdminAnalyticsDashboard = lazy(() => import("@/pages/admin/AnalyticsDashboard"));

// Debug pages
const EnvCheck = lazy(() => import("@/pages/env-check"));

// Tenant management pages
const TenantPage = lazy(() => import("@/pages/tenant"));

// VMS (Vendor Management System) pages
const BureauDashboard = lazy(() => import("@/pages/vms/bureau-dashboard"));
const CompanyDashboard = lazy(() => import("@/pages/vms/company-dashboard"));
const BureauRankings = lazy(() => import("@/pages/vms/bureau-rankings"));
const VMSAnalyticsDashboard = lazy(() => import("@/pages/vms/analytics-dashboard"));
const WorkflowAutomationPage = lazy(() => import("@/pages/vms/workflow-automation"));
const AutoRejectRulesPage = lazy(() => import("@/pages/vms/auto-reject-rules"));
const VMSVendors = lazy(() => import("@/pages/vms/vendors"));
const CandidateSearch = lazy(() => import("@/components/vms/CandidateSearch").then(m => ({ default: m.CandidateSearch })));

// Bureau Portal pages (Phase 3D)
const BureauJobsPage = lazy(() => import("@/pages/bureau/BureauJobsPage"));
const BureauMessagesPage = lazy(() => import("@/pages/bureau/BureauMessagesPage"));

// Bureau Portal Phase 4 - Jobs Received
const BureauJobsReceivedPage = lazy(() => import("@/pages/bureau/jobs-received"));

// Bureau Portal Extended (Phase 3)
const BureauPortalDashboard = lazy(() => import("@/pages/bureau-portal/index"));
const BureauPortalJobs = lazy(() => import("@/pages/bureau-portal/jobs"));
const BureauPortalContracts = lazy(() => import("@/pages/bureau-portal/contracts"));
const BureauPortalPerformance = lazy(() => import("@/pages/bureau-portal/performance"));
const BureauPortalRates = lazy(() => import("@/pages/bureau-portal/rates"));
const BureauPortalSubmitCandidate = lazy(() => import("@/pages/bureau-portal/submit-candidate"));
const BureauPortalMessages = lazy(() => import("@/pages/bureau-portal/messages"));
const BureauPortalShortlists = lazy(() => import("@/pages/bureau-portal/shortlists"));

// Contract Management (Phase 3F)
const ContractTemplatesPage = lazy(() => import("@/pages/contracts/templates"));
const MSAManagementPage = lazy(() => import("@/pages/contracts/msa"));
const ContractsOverviewPage = lazy(() => import("@/pages/contracts/overview"));
const ContractNewSPA = lazy(() => import("@/pages/contracts/new-spa"));
// TODO: These pages need to be converted from Next.js to Wouter/Vite
// TODO: These pages have Next.js dependencies (next-auth/react) - need Vite migration
// const ContractsPage = lazy(() => import("@/pages/contracts/index"));
// const NewContractPage = lazy(() => import("@/pages/contracts/new"));
// const ContractDetailPage = lazy(() => import("@/pages/contracts/[id]/index"));
// const ContractSignPage = lazy(() => import("@/pages/contracts/[id]/sign"));

// Workflow Automation (Phase 3E)
// TODO: Requires reactflow package installation
// const WorkflowsDashboard = lazy(() => import("@/pages/workflows/index"));

// Company Compliance & Bulk Actions (Phase 3)
const BulkActionsPage = lazy(() => import("@/pages/bulk-actions"));
const ComplianceDashboardPage = lazy(() => import("@/pages/compliance"));

function Router() {
  const [location] = useLocation();
  const isLandingPage = location === "/" || location === "/old-homepage";

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <SkipNavigation />
        {!isLandingPage && <Navigation />}
        <main id="main-content" tabIndex={-1}>
          <Switch>
          <Route path="/register" component={() => <PublicLazyRoute component={Register} requireGuest />} />
          <Route path="/login" component={() => <PublicLazyRoute component={Login} requireGuest />} />
          <Route path="/confirm-email" component={() => <PublicLazyRoute component={ConfirmEmail} />} />
          <Route path="/reset-password" component={() => <PublicLazyRoute component={ResetPassword} />} />
          <Route path="/subscribe" component={() => <ProtectedLazyRoute component={Subscribe} />} />
          <Route path="/dashboard/subscription" component={() => <ProtectedLazyRoute component={SubscriptionDashboard} />} />
          <Route path="/dashboard" component={() => <ProtectedLazyRoute component={Dashboard} />} />
          <Route path="/tenant" component={() => <ProtectedLazyRoute component={TenantPage} />} />
          <Route path="/profile" component={() => <ProtectedLazyRoute component={Profile} />} />
          <Route path="/account" component={() => <ProtectedLazyRoute component={AccountPage} />} />
          <Route path="/zzp-profile" component={() => <ProtectedLazyRoute component={ZzpProfilePage} />} />
          <Route path="/public/zzp-profile/:userId" component={() => <PublicLazyRoute component={PublicZzpProfilePage} />} />

          {/* Job routes */}
          <Route path="/jobs" component={() => <PublicLazyRoute component={JobsPage} />} />
          <Route path="/jobs/new" component={() => <ProtectedLazyRoute component={JobFormPage} />} />
          <Route path="/jobs/:id/edit" component={() => <ProtectedLazyRoute component={JobFormPage} />} />
          <Route path="/jobs/:id">
            <PublicLazyRoute component={JobDetailPage} />
          </Route>
          <Route path="/my-jobs" component={() => <ProtectedLazyRoute component={MyJobsPage} />} />
          <Route path="/my-applications" component={() => <ProtectedLazyRoute component={MyApplicationsPage} />} />
          <Route path="/manage-applications" component={() => <ProtectedLazyRoute component={ManageApplicationsPage} />} />

          {/* Message routes */}
          <Route path="/messages" component={() => <ProtectedLazyRoute component={MessagesPage} />} />
          <Route path="/messages/:threadId" component={() => <ProtectedLazyRoute component={MessageThreadPage} />} />
          <Route path="/chat/guest/:token" component={() => <PublicLazyRoute component={GuestChatPage} />} />

          {/* Notifications and preferences */}
          <Route path="/notifications" component={() => <ProtectedLazyRoute component={NotificationsPage} />} />
          <Route path="/notification-preferences" component={() => <ProtectedLazyRoute component={NotificationPreferencesPage} />} />
          <Route path="/job-alert-preferences" component={() => <ProtectedLazyRoute component={JobAlertPreferencesPage} />} />
          <Route path="/job-alerts" component={() => <ProtectedLazyRoute component={JobAlertsPage} />} />
          <Route path="/reminders" component={() => <ProtectedLazyRoute component={EmailRemindersPage} />} />

          {/* Quick Reply Templates - Company only */}
          <Route path="/quick-reply-templates" component={() => <ProtectedLazyRoute component={QuickReplyTemplatesPage} />} />

          {/* Company Verification - Company only */}
          <Route path="/company-verification" component={() => <ProtectedLazyRoute component={CompanyVerificationPage} />} />

          {/* Module 6: Analytics, Payments, and Ratings */}
          <Route path="/analytics" component={() => <ProtectedLazyRoute component={AnalyticsPage} />} />
          <Route path="/payments" component={() => <ProtectedLazyRoute component={PaymentsPage} />} />
          <Route path="/ratings" component={() => <ProtectedLazyRoute component={RatingsPage} />} />

          {/* Stripe Payment Routes */}
          <Route path="/checkout" component={() => <ProtectedLazyRoute component={Checkout} />} />
          <Route path="/payment-success" component={() => <PublicLazyRoute component={PaymentSuccess} />} />

          {/* Admin Routes */}
          <Route path="/email-demo" component={() => <AdminLazyRoute component={EmailDemoPage} />} />
          <Route path="/admin/analytics" component={() => <AdminLazyRoute component={AdminAnalyticsDashboard} />} />

          {/* Debug Routes */}
          <Route path="/env-check" component={() => <PublicLazyRoute component={EnvCheck} />} />

          {/* VMS Routes */}
          <Route path="/vms/bureau-dashboard" component={() => <ProtectedLazyRoute component={BureauDashboard} />} />
          <Route path="/vms/company-dashboard" component={() => <ProtectedLazyRoute component={CompanyDashboard} />} />
          <Route path="/vms/bureau-rankings" component={() => <PublicLazyRoute component={BureauRankings} />} />
          <Route path="/vms/analytics-dashboard" component={() => <ProtectedLazyRoute component={VMSAnalyticsDashboard} />} />
          <Route path="/vms/workflow-automation" component={() => <ProtectedLazyRoute component={WorkflowAutomationPage} />} />
          <Route path="/vms/auto-reject-rules" component={() => <ProtectedLazyRoute component={AutoRejectRulesPage} />} />
          <Route path="/vms/vendors" component={() => <ProtectedLazyRoute component={VMSVendors} />} />
          <Route path="/vms/candidates/search" component={() => <ProtectedLazyRoute component={CandidateSearch} />} />

          {/* Bureau Portal Routes (Phase 3D & Phase 4) */}
          <Route path="/bureau/jobs" component={() => <ProtectedLazyRoute component={BureauJobsPage} />} />
          <Route path="/bureau/messages" component={() => <ProtectedLazyRoute component={BureauMessagesPage} />} />
          <Route path="/bureau/jobs-received" component={() => <ProtectedLazyRoute component={BureauJobsReceivedPage} />} />

          {/* Bureau Portal Extended Routes (Phase 3) */}
          <Route path="/bureau-portal" component={() => <ProtectedLazyRoute component={BureauPortalDashboard} />} />
          <Route path="/bureau-portal/jobs" component={() => <ProtectedLazyRoute component={BureauPortalJobs} />} />
          <Route path="/bureau-portal/contracts" component={() => <ProtectedLazyRoute component={BureauPortalContracts} />} />
          <Route path="/bureau-portal/performance" component={() => <ProtectedLazyRoute component={BureauPortalPerformance} />} />
          <Route path="/bureau-portal/rates" component={() => <ProtectedLazyRoute component={BureauPortalRates} />} />
          <Route path="/bureau-portal/submit-candidate" component={() => <ProtectedLazyRoute component={BureauPortalSubmitCandidate} />} />
          <Route path="/bureau-portal/messages" component={() => <ProtectedLazyRoute component={BureauPortalMessages} />} />
          <Route path="/bureau-portal/shortlists" component={() => <ProtectedLazyRoute component={BureauPortalShortlists} />} />

          {/* Contract Management Routes (Phase 3F) */}
          <Route path="/contracts" component={() => <ProtectedLazyRoute component={ContractsOverviewPage} />} />
          <Route path="/contracts/new" component={() => <ProtectedLazyRoute component={ContractNewSPA} />} />
          <Route path="/contracts/templates" component={() => <ProtectedLazyRoute component={ContractTemplatesPage} />} />
          <Route path="/contracts/msa" component={() => <ProtectedLazyRoute component={MSAManagementPage} />} />
          {/* TODO: Convert from Next.js to Vite (next-auth dependency) */}
          {/* <Route path="/contracts/new" component={() => <ProtectedLazyRoute component={NewContractPage} />} /> */}
          {/* <Route path="/contracts/:id/sign" component={() => <ProtectedLazyRoute component={ContractSignPage} />} /> */}
          {/* <Route path="/contracts/:id" component={() => <ProtectedLazyRoute component={ContractDetailPage} />} /> */}
          {/* <Route path="/contracts" component={() => <ProtectedLazyRoute component={ContractsPage} />} /> */}

          {/* Company Compliance & Bulk Actions Routes (Phase 3) */}
          <Route path="/bulk-actions" component={() => <ProtectedLazyRoute component={BulkActionsPage} />} />
          <Route path="/compliance" component={() => <ProtectedLazyRoute component={ComplianceDashboardPage} />} />

          {/* Workflow Automation Routes (Phase 3E) */}
          {/* TODO: Requires reactflow package or alternative workflow page */}
          {/* <Route path="/workflows" component={() => <ProtectedLazyRoute component={WorkflowsDashboard} />} /> */}

          {/* Homepage Routes */}
          <Route path="/old-homepage" component={TalentMarktLanding} />
          <Route path="/prev-homepage" component={NewHomepage} />
          <Route path="/" component={NewLandingpage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vacaturemarkt-theme">
        <TooltipProvider>
          <AppProvider>
            <LanguageProvider>
              <Toaster />
              <Router />
            </LanguageProvider>
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
