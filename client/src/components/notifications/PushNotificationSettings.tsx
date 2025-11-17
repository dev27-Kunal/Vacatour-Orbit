import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  MessageSquare, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Smartphone,
  Mail
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newMessageEmail: boolean;
  newMessagePush: boolean;
  newApplicationEmail: boolean;
  newApplicationPush: boolean;
  jobStatusEmail: boolean;
  jobStatusPush: boolean;
}

export default function PushNotificationSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading: pushLoading,
    error: pushError,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification
  } = usePushNotifications();

  // Get notification preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notifications/preferences'],
  });

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      return apiRequest('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: t('notifications.push.settingsSaved'),
        description: t('notifications.push.settingsSavedDescription'),
      });
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast({
        title: t('notifications.push.saveError'),
        description: t('notifications.push.saveErrorDescription'),
        variant: 'destructive',
      });
    },
  });

  const handleTogglePreference = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const handleEnablePushNotifications = async () => {
    const success = await subscribe();
    if (success) {
      // Also enable push notifications in preferences
      updatePreferencesMutation.mutate({ pushNotifications: true });
    }
  };

  const handleDisablePushNotifications = async () => {
    const success = await unsubscribe();
    if (success) {
      // Also disable push notifications in preferences
      updatePreferencesMutation.mutate({ pushNotifications: false });
    }
  };

  const handleTestNotification = () => {
    showLocalNotification({
      title: t('notifications.push.testNotification'),
      body: t('notifications.push.testMessage'),
      icon: '/favicon.ico',
    });
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('notifications.push.granted')}
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {t('notifications.push.denied')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('notifications.push.notRequested')}
          </Badge>
        );
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            {t('notifications.push.notSupported')}
          </CardTitle>
          <CardDescription>
            {t('notifications.push.browserNotSupported')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            {t('notifications.push.status')}
          </CardTitle>
          <CardDescription>
            {t('notifications.push.manageSettings')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('notifications.push.browserPermission')}</p>
              <p className="text-sm text-gray-500">{t('notifications.push.permissionDescription')}</p>
            </div>
            {getPermissionStatus()}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('notifications.push.subscription')}</p>
              <p className="text-sm text-gray-500">
                {isSubscribed ? t('notifications.push.subscriptionActive') : t('notifications.push.subscriptionInactive')}
              </p>
            </div>
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? (
                <>
                  <Bell className="w-3 h-3 mr-1" />
                  {t('notifications.push.active')}
                </>
              ) : (
                <>
                  <BellOff className="w-3 h-3 mr-1" />
                  {t('notifications.push.inactive')}
                </>
              )}
            </Badge>
          </div>

          {pushError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('notifications.push.error')}</AlertTitle>
              <AlertDescription>{pushError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {!isSubscribed ? (
              <Button 
                onClick={handleEnablePushNotifications}
                disabled={pushLoading || permission === 'denied'}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                {permission === 'default' ? t('notifications.push.requestAndEnable') : t('notifications.push.enable')}
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={handleDisablePushNotifications}
                disabled={pushLoading}
                className="flex items-center gap-2"
              >
                <BellOff className="w-4 h-4" />
                {t('notifications.push.disable')}
              </Button>
            )}
            
            {isSubscribed && (
              <Button 
                variant="outline"
                onClick={handleTestNotification}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('notifications.push.testNotification')}
              </Button>
            )}
          </div>

          {permission === 'denied' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('notifications.push.blocked')}</AlertTitle>
              <AlertDescription>
                {t('notifications.push.blockedDescription')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            {t('notifications.push.preferences')}
          </CardTitle>
          <CardDescription>
            {t('notifications.push.preferencesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {preferencesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Global Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">{t('notifications.push.globalSettings')}</h4>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{t('notifications.push.emailNotifications')}</p>
                      <p className="text-sm text-gray-500">{t('notifications.push.emailDescription')}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.emailNotifications || false}
                    onCheckedChange={(checked) => handleTogglePreference('emailNotifications', checked)}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t('notifications.push.pushNotifications')}</p>
                      <p className="text-sm text-gray-500">{t('notifications.push.pushDescription')}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.pushNotifications || false}
                    onCheckedChange={(checked) => handleTogglePreference('pushNotifications', checked)}
                    disabled={updatePreferencesMutation.isPending || !isSubscribed}
                  />
                </div>
              </div>

              <Separator />

              {/* Specific Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">{t('notifications.push.specificNotifications')}</h4>
                
                {/* New Messages */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{t('notifications.push.newMessages')}</span>
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('notifications.push.emailOption')}</span>
                      <Switch
                        checked={preferences?.newMessageEmail || false}
                        onCheckedChange={(checked) => handleTogglePreference('newMessageEmail', checked)}
                        disabled={updatePreferencesMutation.isPending || !preferences?.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('notifications.push.pushOption')}</span>
                      <Switch
                        checked={preferences?.newMessagePush || false}
                        onCheckedChange={(checked) => handleTogglePreference('newMessagePush', checked)}
                        disabled={updatePreferencesMutation.isPending || !preferences?.pushNotifications}
                      />
                    </div>
                  </div>
                </div>

                {/* New Applications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{t('notifications.push.newApplications')}</span>
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('notifications.push.emailOption')}</span>
                      <Switch
                        checked={preferences?.newApplicationEmail || false}
                        onCheckedChange={(checked) => handleTogglePreference('newApplicationEmail', checked)}
                        disabled={updatePreferencesMutation.isPending || !preferences?.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('notifications.push.pushOption')}</span>
                      <Switch
                        checked={preferences?.newApplicationPush || false}
                        onCheckedChange={(checked) => handleTogglePreference('newApplicationPush', checked)}
                        disabled={updatePreferencesMutation.isPending || !preferences?.pushNotifications}
                      />
                    </div>
                  </div>
                </div>

                {/* Job Status Updates */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{t('notifications.push.statusUpdates')}</span>
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('notifications.push.emailOption')}</span>
                      <Switch
                        checked={preferences?.jobStatusEmail || false}
                        onCheckedChange={(checked) => handleTogglePreference('jobStatusEmail', checked)}
                        disabled={updatePreferencesMutation.isPending || !preferences?.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('notifications.push.pushOption')}</span>
                      <Switch
                        checked={preferences?.jobStatusPush || false}
                        onCheckedChange={(checked) => handleTogglePreference('jobStatusPush', checked)}
                        disabled={updatePreferencesMutation.isPending || !preferences?.pushNotifications}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}