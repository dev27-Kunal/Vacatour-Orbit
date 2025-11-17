import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/contexts/TenantContext';
import { TenantSwitcher } from '@/components/tenant/TenantSwitcher';
import { TenantOnboarding } from '@/components/tenant/TenantOnboarding';
import { TenantSettings } from '@/components/tenant/TenantSettings';
import { TenantMembers } from '@/components/tenant/TenantMembers';
import { TenantInvite } from '@/components/tenant/TenantInvite';
import { PageWrapper } from "@/components/page-wrapper";
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Plus,
  Briefcase,
  UserCheck,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TenantPage() {
  const { currentTenant, currentMembership, userTenants } = useTenant();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // Mock data for demonstration - in real app, fetch from API
  const tenantStats = {
    totalJobs: 24,
    activeJobs: 12,
    totalApplications: 156,
    pendingApplications: 23,
    totalMembers: 8,
    activeMembers: 7,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'job_created',
      title: 'New job posted: Senior React Developer',
      time: '2 hours ago',
      user: 'John Doe',
    },
    {
      id: 2,
      type: 'member_joined',
      title: 'Sarah Wilson joined the organization',
      time: '1 day ago',
      user: 'Sarah Wilson',
    },
    {
      id: 3,
      type: 'application_received',
      title: '5 new applications received',
      time: '2 days ago',
      user: 'System',
    },
  ];

  const handleCreateTenant = () => {
    setShowOnboarding(true);
  };

  const handleInviteMember = () => {
    setShowInvite(true);
  };

  const handleOnboardingComplete = () => {
    // Refresh tenant data after creation
    setActiveTab('overview');
  };

  const handleInviteSuccess = () => {
    // Refresh member data after invitation
    if (activeTab === 'members') {
      // This will be handled by the TenantMembers component
    }
  };

  // Show onboarding if user has no tenants
  if (userTenants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t('tenant.welcome')}</h1>
            <p className="text-lg text-muted-foreground">{t('tenant.createOrgPrompt')}</p>
          </div>

          <Card className="text-left feature-card bg-card">
            <CardHeader>
              <CardTitle>{t('tenant.getStarted')}</CardTitle>
              <CardDescription>
                {t('tenant.getStartedDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">{t('tenant.steps.createOrg')}</h3>
                  <p className="text-sm text-muted-foreground">{t('tenant.steps.createOrgDesc')}</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium">{t('tenant.steps.inviteTeam')}</h3>
                  <p className="text-sm text-muted-foreground">{t('tenant.steps.inviteTeamDesc')}</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium">{t('tenant.steps.postJobs')}</h3>
                  <p className="text-sm text-muted-foreground">{t('tenant.steps.postJobsDesc')}</p>
                </div>
              </div>
              
              <Button 
                onClick={handleCreateTenant} 
                className="w-full"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                {t('tenant.createFirstOrg')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <TenantOnboarding
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
          onComplete={handleOnboardingComplete}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('tenant.organizationDashboard')}</h1>
          <p className="text-muted-foreground">{t('tenant.orgDashboardDesc')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <TenantSwitcher 
            onCreateNew={handleCreateTenant}
            className="w-64"
          />
        </div>
      </div>

      {/* Current Tenant Info */}
      {currentTenant && (
        <Card className="feature-card bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{currentTenant.name}</span>
                    <Badge 
                      variant={currentTenant.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {currentTenant.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {currentTenant.description || 'No description provided'}
                  </CardDescription>
                </div>
              </div>
              
              {currentMembership && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  {currentMembership.role}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.totalJobs}</div>
                <p className="text-xs text-muted-foreground">
                  {tenantStats.activeJobs} currently active
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  {tenantStats.pendingApplications} pending review
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  {tenantStats.activeMembers} active members
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  New applications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="feature-card bg-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <TenantMembers onInviteMember={handleInviteMember} />
        </TabsContent>

        <TabsContent value="settings">
          <TenantSettings />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="feature-card bg-card">
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed insights and metrics for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Analytics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed analytics and reporting features will be available soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TenantOnboarding
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
      
      <TenantInvite
        open={showInvite}
        onOpenChange={setShowInvite}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}
