import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, BellRing, CheckCircle, MapPin, Clock, Briefcase, X } from "lucide-react";
import { useState } from "react";
import { PageWrapper } from "@/components/page-wrapper";
import { apiPatch } from "@/lib/api-client";
import { useTranslation } from "react-i18next";

interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  newMessageEmail: boolean;
  newApplicationEmail: boolean;
  jobStatusEmail: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JobAlertPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  vastJobsEnabled: boolean;
  interimJobsEnabled: boolean;
  uitzendenjobsEnabled: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
  locationRadius: number;
  preferredLocations: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NotificationPreferences() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newLocation, setNewLocation] = useState("");

  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notifications/preferences"],
  });

  const { data: jobAlertPreferences, isLoading: jobAlertLoading } = useQuery<JobAlertPreferences>({
    queryKey: ["/api/job-alerts/preferences"],
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const response = await apiPatch("/api/notifications/preferences", updates);

      if (!response.success) {
        throw new Error(response.error || "Failed to update preferences");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
      toast({
        title: t('notificationPreferences.toast.updateSuccess.title'),
        description: t('notificationPreferences.toast.updateSuccess.desc'),
      });
    },
    onError: () => {
      toast({
        title: t('notificationPreferences.toast.updateError.title'),
        description: t('notificationPreferences.toast.updateError.desc'),
        variant: "destructive",
      });
    },
  });

  const updateJobAlertPreferences = useMutation({
    mutationFn: async (updates: Partial<JobAlertPreferences>) => {
      const response = await apiPatch("/api/job-alerts/preferences", updates);

      if (!response.success) {
        throw new Error(response.error || "Failed to update job alert preferences");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-alerts/preferences"] });
      toast({
        title: t('notificationPreferences.toast.jobAlertsSuccess.title'),
        description: t('notificationPreferences.toast.jobAlertsSuccess.desc'),
      });
    },
    onError: () => {
      toast({
        title: t('notificationPreferences.toast.jobAlertsError.title'),
        description: t('notificationPreferences.toast.jobAlertsError.desc'),
        variant: "destructive",
      });
    },
  });

  const handleToggle = (field: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) {return;}
    
    updatePreferences.mutate({
      [field]: value,
    });
  };

  const handleJobAlertToggle = (field: keyof JobAlertPreferences, value: boolean | string | number) => {
    if (!jobAlertPreferences) {return;}
    
    updateJobAlertPreferences.mutate({
      [field]: value,
    });
  };

  const addLocation = () => {
    if (!newLocation.trim() || !jobAlertPreferences) {return;}
    
    const updatedLocations = [...jobAlertPreferences.preferredLocations, newLocation.trim()];
    updateJobAlertPreferences.mutate({
      preferredLocations: updatedLocations,
    });
    setNewLocation("");
  };

  const removeLocation = (locationToRemove: string) => {
    if (!jobAlertPreferences) {return;}
    
    const updatedLocations = jobAlertPreferences.preferredLocations.filter(
      (location) => location !== locationToRemove
    );
    updateJobAlertPreferences.mutate({
      preferredLocations: updatedLocations,
    });
  };

  if (isLoading || jobAlertLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        </div>
      </PageWrapper>
    );
  }

  if (!preferences && !jobAlertPreferences) {
    return (
      <PageWrapper>
        <div className="container mx-auto p-6">
        <Card className="feature-card bg-card">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">{t('notificationPreferences.empty')}</p>
          </CardContent>
        </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">{t('notificationPreferences.title')}</h1>
          <p className="text-gray-600">{t('notificationPreferences.subtitle')}</p>
        </div>
      </div>

{preferences && (
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('notificationPreferences.email.title')}
            </CardTitle>
            <CardDescription>
              {t('notificationPreferences.email.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  {t('notificationPreferences.email.master.label')}
                </Label>
                <p className="text-sm text-gray-500">{t('notificationPreferences.email.master.desc')}</p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => handleToggle("emailNotifications", checked)}
                data-testid="switch-email-notifications"
              />
            </div>

          <Separator />

          {/* Individual notification settings */}
          <div className="space-y-4 opacity-60 data-[enabled=true]:opacity-100" data-enabled={preferences.emailNotifications}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-message" className="text-base">
                  <BellRing className="inline h-4 w-4 mr-2" />
                  {t('notificationPreferences.email.newMessage.label')}
                </Label>
                <p className="text-sm text-gray-500">{t('notificationPreferences.email.newMessage.desc')}</p>
              </div>
              <Switch
                id="new-message"
                checked={preferences.newMessageEmail}
                onCheckedChange={(checked) => handleToggle("newMessageEmail", checked)}
                disabled={!preferences.emailNotifications}
                data-testid="switch-new-message"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-application" className="text-base">
                  <CheckCircle className="inline h-4 w-4 mr-2" />
                  {t('notificationPreferences.email.newApplication.label')}
                </Label>
                <p className="text-sm text-gray-500">{t('notificationPreferences.email.newApplication.desc')}</p>
              </div>
              <Switch
                id="new-application"
                checked={preferences.newApplicationEmail}
                onCheckedChange={(checked) => handleToggle("newApplicationEmail", checked)}
                disabled={!preferences.emailNotifications}
                data-testid="switch-new-application"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="job-status" className="text-base">
                  <Bell className="inline h-4 w-4 mr-2" />
                  {t('notificationPreferences.email.jobStatus.label')}
                </Label>
                <p className="text-sm text-gray-500">{t('notificationPreferences.email.jobStatus.desc')}</p>
              </div>
              <Switch
                id="job-status"
                checked={preferences.jobStatusEmail}
                onCheckedChange={(checked) => handleToggle("jobStatusEmail", checked)}
                disabled={!preferences.emailNotifications}
                data-testid="switch-job-status"
              />
            </div>
          </div>

          <Separator />

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">{t('notificationPreferences.email.tip')}</p>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Job Alerts Section */}
      {jobAlertPreferences && (
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('notificationPreferences.jobAlerts.title')}
            </CardTitle>
            <CardDescription>
              {t('notificationPreferences.jobAlerts.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master job alerts toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="job-alerts-enabled" className="text-base font-medium">
                  {t('notificationPreferences.jobAlerts.master.label')}
                </Label>
                <p className="text-sm text-gray-500">{t('notificationPreferences.jobAlerts.master.desc')}</p>
              </div>
              <Switch
                id="job-alerts-enabled"
                checked={jobAlertPreferences.emailEnabled}
                onCheckedChange={(checked) => handleJobAlertToggle("emailEnabled", checked)}
                data-testid="switch-job-alerts-enabled"
              />
            </div>

            <Separator />

            {/* Job alert settings */}
            <div className="space-y-6 opacity-60 data-[enabled=true]:opacity-100" data-enabled={jobAlertPreferences.emailEnabled}>
              {/* Frequency Settings */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('notificationPreferences.jobAlerts.frequency.label')}
                </Label>
                <Select
                  value={jobAlertPreferences.emailFrequency}
                  onValueChange={(value) => handleJobAlertToggle("emailFrequency", value)}
                  disabled={!jobAlertPreferences.emailEnabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('notificationPreferences.jobAlerts.frequency.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">{t('notificationPreferences.jobAlerts.frequency.instant')}</SelectItem>
                    <SelectItem value="daily">{t('notificationPreferences.jobAlerts.frequency.daily')}</SelectItem>
                    <SelectItem value="weekly">{t('notificationPreferences.jobAlerts.frequency.weekly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Job Types */}
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('notificationPreferences.jobAlerts.jobTypes.label')}</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="vast-jobs" className="text-base">
                      {t('notificationPreferences.jobAlerts.jobTypes.vast.label')}
                    </Label>
                    <p className="text-sm text-gray-500">{t('notificationPreferences.jobAlerts.jobTypes.vast.desc')}</p>
                  </div>
                  <Switch
                    id="vast-jobs"
                    checked={jobAlertPreferences.vastJobsEnabled}
                    onCheckedChange={(checked) => handleJobAlertToggle("vastJobsEnabled", checked)}
                    disabled={!jobAlertPreferences.emailEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="interim-jobs" className="text-base">
                      {t('notificationPreferences.jobAlerts.jobTypes.interim.label')}
                    </Label>
                    <p className="text-sm text-gray-500">{t('notificationPreferences.jobAlerts.jobTypes.interim.desc')}</p>
                  </div>
                  <Switch
                    id="interim-jobs"
                    checked={jobAlertPreferences.interimJobsEnabled}
                    onCheckedChange={(checked) => handleJobAlertToggle("interimJobsEnabled", checked)}
                    disabled={!jobAlertPreferences.emailEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="uitzenden-jobs" className="text-base">
                      {t('notificationPreferences.jobAlerts.jobTypes.uitzenden.label')}
                    </Label>
                    <p className="text-sm text-gray-500">{t('notificationPreferences.jobAlerts.jobTypes.uitzenden.desc')}</p>
                  </div>
                  <Switch
                    id="uitzenden-jobs"
                    checked={jobAlertPreferences.uitzendenjobsEnabled}
                    onCheckedChange={(checked) => handleJobAlertToggle("uitzendenjobsEnabled", checked)}
                    disabled={!jobAlertPreferences.emailEnabled}
                  />
                </div>
              </div>

              <Separator />

              {/* Location Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('notificationPreferences.jobAlerts.locations.label')}
                </Label>
                
                {/* Location Radius */}
                <div className="space-y-2">
                  <Label htmlFor="location-radius" className="text-sm">
                    {t('notificationPreferences.jobAlerts.locations.radiusLabel', { km: jobAlertPreferences.locationRadius })}
                  </Label>
                  <Input
                    id="location-radius"
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={jobAlertPreferences.locationRadius}
                    onChange={(e) => handleJobAlertToggle("locationRadius", parseInt(e.target.value))}
                    disabled={!jobAlertPreferences.emailEnabled}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('notificationPreferences.jobAlerts.locations.scale.local')}</span>
                    <span>{t('notificationPreferences.jobAlerts.locations.scale.national')}</span>
                  </div>
                </div>

                {/* Preferred Locations */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('notificationPreferences.jobAlerts.locations.preferredLabel')}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('notificationPreferences.jobAlerts.locations.placeholder')}
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                      disabled={!jobAlertPreferences.emailEnabled}
                    />
                    <Button
                      type="button"
                      onClick={addLocation}
                      disabled={!newLocation.trim() || !jobAlertPreferences.emailEnabled}
                      size="sm"
                    >
                      {t('notificationPreferences.jobAlerts.locations.add')}
                    </Button>
                  </div>
                  
                  {jobAlertPreferences.preferredLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobAlertPreferences.preferredLocations.map((location, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {location}
                          <button
                            onClick={() => removeLocation(location)}
                            className="ml-1 hover:text-red-600"
                            disabled={!jobAlertPreferences.emailEnabled}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">{t('notificationPreferences.jobAlerts.locations.info')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </PageWrapper>
  );
}
