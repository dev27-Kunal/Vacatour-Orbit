import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/providers/AppProvider';
import {
  Mail,
  Settings,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Pause,
  Play,
  Trash2,
  Eye,
  Filter,
  Bell
} from 'lucide-react';
import { apiPatch, apiPost } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface NotificationPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  newMessageEmail: boolean;
  newApplicationEmail: boolean;
  jobStatusEmail: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JobDistributionPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
  vastJobsEnabled: boolean;
  interimJobsEnabled: boolean;
  uitzendenjobsEnabled: boolean;
  locationRadius: number;
  preferredLocations: string[];
}

interface EmailReminderStats {
  totalReminders: number;
  activeReminders: number;
  thisWeekSent: number;
  totalSent: number;
  pendingReminders: number;
  failedReminders: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  notificationPreferences?: NotificationPreference;
  jobDistributionPreferences?: JobDistributionPreference;
}

export default function EmailRemindersPage() {
  const { user } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  // Fetch email reminder statistics
  const { data: stats, isLoading: statsLoading } = useQuery<EmailReminderStats>({
    queryKey: ['/api/admin/email-stats'],
    enabled: !!user?.isAdmin,
  });

  // Fetch all users with notification preferences (admin only)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users-notifications'],
    enabled: !!user?.isAdmin,
  });

  // Fetch current user's preferences
  const { data: userPreferences } = useQuery<{
    notifications: NotificationPreference;
    jobAlerts: JobDistributionPreference;
  }>({
    queryKey: ['/api/notification-preferences'],
    enabled: !!user,
  });

  // Mutation to update user notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreference>) => {
      const response = await apiPatch('/api/notification-preferences', updates);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update preferences');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({ title: 'Voorkeuren bijgewerkt', description: 'Je e-mail instellingen zijn opgeslagen.' });
    },
    onError: () => {
      toast({ 
        title: 'Fout', 
        description: 'Kon voorkeuren niet bijwerken.', 
        variant: 'destructive' 
      });
    },
  });

  // Mutation for bulk email operations (admin only)
  const bulkEmailMutation = useMutation({
    mutationFn: async ({ action, userIds }: { action: string; userIds?: string[] }) => {
      const response = await apiPost<{ affected: number }>('/api/admin/bulk-email', { action, userIds });
      if (!response.success) {
        throw new Error(response.error || 'Failed to perform bulk action');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-stats'] });
      toast({
        title: 'Actie voltooid',
        description: `${data?.affected || 0} gebruikers bijgewerkt.`
      });
    },
    onError: () => {
      toast({ 
        title: 'Fout', 
        description: 'Kon bulk actie niet uitvoeren.', 
        variant: 'destructive' 
      });
    },
  });

  const handleToggleNotification = (field: keyof NotificationPreference, value: boolean) => {
    updatePreferencesMutation.mutate({ [field]: value });
  };

  const handleBulkAction = (action: string, userIds?: string[]) => {
    bulkEmailMutation.mutate({ action, userIds });
  };

  const filteredUsers = users?.filter(user => {
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (selectedFilter === 'active') {
      return user.notificationPreferences?.emailNotifications;
    }
    if (selectedFilter === 'inactive') {
      return !user.notificationPreferences?.emailNotifications;
    }
    return true;
  });

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">{t('common.loginRequired', { defaultValue: 'You need to be logged in to view this page.' })}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Mail className="mr-3 h-8 w-8 text-blue-600" />
            {t('emailReminders.title', { defaultValue: 'Email Reminders Overview' })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('emailReminders.subtitle', { defaultValue: 'Manage all automatic follow-up emails to companies' })}
          </p>
        </div>
        {user.isAdmin && (
          <Button 
            onClick={() => handleBulkAction('refresh-stats')}
            variant="outline"
            className="flex items-center"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {t('emailReminders.refresh', { defaultValue: 'Refresh' })}
          </Button>
        )}
      </div>

      <Tabs defaultValue={user.isAdmin ? "overview" : "preferences"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {user.isAdmin && (
            <TabsTrigger value="overview">{t('emailReminders.tabs.adminOverview', { defaultValue: 'Admin Overview' })}</TabsTrigger>
          )}
          <TabsTrigger value="preferences">{t('emailReminders.tabs.myPreferences', { defaultValue: 'My Preferences' })}</TabsTrigger>
        </TabsList>

        {/* Admin Overview Tab */}
        {user.isAdmin && (
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Totaal reminders</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.totalReminders || 0}
                      </p>
                    </div>
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actief</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.activeReminders || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deze week</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats?.thisWeekSent || 0}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Totaal verzonden</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats?.totalSent || 0}
                      </p>
                    </div>
                    <Send className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bulk Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Bulk Acties
                </CardTitle>
                <CardDescription>
                  Beheer e-mail notificaties voor alle gebruikers tegelijkertijd
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => handleBulkAction('enable-all')}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Alles Inschakelen
                  </Button>
                  <Button 
                    onClick={() => handleBulkAction('disable-all')}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Alles Uitschakelen
                  </Button>
                  <Button 
                    onClick={() => handleBulkAction('disable-job-alerts')}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Vacature Alerts Uit
                  </Button>
                  <Button 
                    onClick={() => handleBulkAction('reset-frequencies')}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Reset Frequenties
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Gebruikers Beheer ({filteredUsers?.length || 0})
                </CardTitle>
                <CardDescription>
                  Overzicht en beheer van alle gebruikers e-mail voorkeuren
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter gebruikers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle gebruikers</SelectItem>
                        <SelectItem value="active">E-mail actief</SelectItem>
                        <SelectItem value="inactive">E-mail inactief</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Zoek op naam of e-mail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </div>

                {/* Users List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : filteredUsers?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Geen gebruikers gevonden
                    </div>
                  ) : (
                    filteredUsers?.map((userItem) => (
                      <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{userItem.name}</p>
                            <p className="text-sm text-gray-500">{userItem.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{userItem.userType}</Badge>
                              {userItem.notificationPreferences?.emailNotifications && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  E-mail Actief
                                </Badge>
                              )}
                              {userItem.jobDistributionPreferences?.emailEnabled && (
                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                  Vacature Alerts
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to user detail view
                              window.open(`/admin/users/${userItem.id}`, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* User Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                E-mail Notificaties
              </CardTitle>
              <CardDescription>
                Beheer welke e-mail notificaties je wilt ontvangen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">E-mail notificaties</Label>
                  <p className="text-sm text-gray-500">
                    Hoofdschakelaar voor alle e-mail notificaties
                  </p>
                </div>
                <Switch
                  checked={userPreferences?.notifications?.emailNotifications || false}
                  onCheckedChange={(checked) => handleToggleNotification('emailNotifications', checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <Separator />

              {/* Individual Settings */}
              <div className="space-y-4 opacity-60 data-[enabled=true]:opacity-100" 
                   data-enabled={userPreferences?.notifications?.emailNotifications}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nieuwe berichten</Label>
                    <p className="text-sm text-gray-500">
                      E-mail wanneer je een nieuw bericht ontvangt
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.notifications?.newMessageEmail || false}
                    onCheckedChange={(checked) => handleToggleNotification('newMessageEmail', checked)}
                    disabled={!userPreferences?.notifications?.emailNotifications || updatePreferencesMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nieuwe sollicitaties</Label>
                    <p className="text-sm text-gray-500">
                      E-mail wanneer iemand solliciteert op je vacature
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.notifications?.newApplicationEmail || false}
                    onCheckedChange={(checked) => handleToggleNotification('newApplicationEmail', checked)}
                    disabled={!userPreferences?.notifications?.emailNotifications || updatePreferencesMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Status wijzigingen</Label>
                    <p className="text-sm text-gray-500">
                      E-mail bij wijzigingen in sollicitatie status
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.notifications?.jobStatusEmail || false}
                    onCheckedChange={(checked) => handleToggleNotification('jobStatusEmail', checked)}
                    disabled={!userPreferences?.notifications?.emailNotifications || updatePreferencesMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Distribution Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Vacature Alerts
              </CardTitle>
              <CardDescription>
                Stel in hoe vaak je nieuwe vacatures per e-mail wilt ontvangen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Vacature e-mails</Label>
                  <p className="text-sm text-gray-500">
                    Ontvang nieuwe vacatures per e-mail
                  </p>
                </div>
                <Switch
                  checked={userPreferences?.jobAlerts?.emailEnabled || false}
                  onCheckedChange={async (checked) => {
                    // Update job distribution preferences
                    const response = await apiPatch('/api/job-distribution-preferences', { emailEnabled: checked });
                    if (!response.success) {
                      toast({
                        title: 'Fout',
                        description: response.error || 'Kon instelling niet bijwerken',
                        variant: 'destructive'
                      });
                    }
                  }}
                />
              </div>

              {userPreferences?.jobAlerts?.emailEnabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <Label>Frequentie</Label>
                      <Select
                        value={userPreferences?.jobAlerts?.emailFrequency || 'daily'}
                        onValueChange={async (value) => {
                          const response = await apiPatch('/api/job-distribution-preferences', { emailFrequency: value });
                          if (!response.success) {
                            toast({
                              title: 'Fout',
                              description: response.error || 'Kon frequentie niet bijwerken',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Direct</SelectItem>
                          <SelectItem value="daily">Dagelijks</SelectItem>
                          <SelectItem value="weekly">Wekelijks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
