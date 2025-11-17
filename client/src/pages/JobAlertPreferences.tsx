import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  Bell, 
  Mail, 
  Clock, 
  MapPin, 
  Briefcase, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  Loader2,
  Settings,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/page-wrapper";
import { apiPatch } from "@/lib/api-client";
import type {
  JobDistributionPreferences,
  JobAlertFormData,
  JobAlertPreferencesState,
  JobAlertFieldName
} from "@/types/job-alerts";

export default function JobAlertPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  // Local state for form management
  const [formData, setFormData] = useState<JobAlertFormData>({
    emailEnabled: false,
    vastJobsEnabled: false,
    interimJobsEnabled: false,
    uitzendenjobsEnabled: false,
    emailFrequency: 'daily',
    locationRadius: 50,
    preferredLocations: [],
  });
  
  const [newLocation, setNewLocation] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [componentState, setComponentState] = useState<JobAlertPreferencesState>({
    isLoading: true,
    isSaving: false,
    hasError: false,
    errorMessage: null,
  });

  // Fetch current preferences
  const { data: preferences, isLoading, error, refetch } = useQuery<JobDistributionPreferences>({
    queryKey: ["/api/job-alerts/preferences"],
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        emailEnabled: preferences.emailEnabled,
        vastJobsEnabled: preferences.vastJobsEnabled,
        interimJobsEnabled: preferences.interimJobsEnabled,
        uitzendenjobsEnabled: preferences.uitzendenjobsEnabled,
        emailFrequency: preferences.emailFrequency,
        locationRadius: preferences.locationRadius,
        preferredLocations: preferences.preferredLocations,
      });
      setComponentState(prev => ({
        ...prev,
        isLoading: false,
        hasError: false,
        errorMessage: null,
      }));
    }
  }, [preferences]);

  // Handle loading and error states
  useEffect(() => {
    if (error) {
      setComponentState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Failed to load preferences',
      }));
    }
  }, [error]);

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (data: Partial<JobAlertFormData>) => {
      const response = await apiPatch("/api/job-alerts/preferences", data);

      if (!response.success) {
        throw new Error(response.error || "Failed to update preferences");
      }

      return response.data;
    },
    onMutate: () => {
      setComponentState(prev => ({ ...prev, isSaving: true }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-alerts/preferences"] });
      setHasUnsavedChanges(false);
      setComponentState(prev => ({ ...prev, isSaving: false }));
      toast({
        title: t("jobAlerts.success"),
        description: t("jobAlerts.successDescription"),
        duration: 4000,
      });
    },
    onError: (error) => {
      setComponentState(prev => ({ 
        ...prev, 
        isSaving: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("jobAlerts.errorDescription"),
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Handle field updates with optimistic UI updates
  const handleFieldUpdate = <K extends JobAlertFieldName>(
    field: K, 
    value: JobAlertFormData[K],
    immediate = false
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // For certain fields, save immediately (like toggles)
    if (immediate) {
      const updateData = { [field]: value };
      savePreferences.mutate(updateData);
    }
  };

  // Handle location management
  const addLocation = () => {
    const location = newLocation.trim();
    if (!location || formData.preferredLocations.includes(location)) {return;}
    
    const updatedLocations = [...formData.preferredLocations, location];
    handleFieldUpdate('preferredLocations', updatedLocations, true);
    setNewLocation("");
  };

  const removeLocation = (locationToRemove: string) => {
    const updatedLocations = formData.preferredLocations.filter(
      (location) => location !== locationToRemove
    );
    handleFieldUpdate('preferredLocations', updatedLocations, true);
  };

  // Save all changes
  const handleSaveAll = () => {
    if (!hasUnsavedChanges) {return;}
    savePreferences.mutate(formData);
  };

  // Cancel changes and revert to saved state
  const handleCancel = () => {
    if (!preferences) {return;}
    
    setFormData({
      emailEnabled: preferences.emailEnabled,
      vastJobsEnabled: preferences.vastJobsEnabled,
      interimJobsEnabled: preferences.interimJobsEnabled,
      uitzendenjobsEnabled: preferences.uitzendenjobsEnabled,
      emailFrequency: preferences.emailFrequency,
      locationRadius: preferences.locationRadius,
      preferredLocations: preferences.preferredLocations,
    });
    setHasUnsavedChanges(false);
  };

  // Loading state
  if (isLoading || componentState.isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <div>
              <h1 className="text-3xl font-bold">{t("jobAlerts.title")}</h1>
              <p className="text-gray-600">{t("common.loading")}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 700 rounded animate-pulse"></div>
            <div className="h-64 bg-gray-200 700 rounded animate-pulse"></div>
          </div>
        </div>
        </div>
      </PageWrapper>
    );
  }

  // Error state with retry option
  if (componentState.hasError && !preferences) {
    return (
      <PageWrapper>
        <div className="container mx-auto p-6">
        <Card className="feature-card bg-card">
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {componentState.errorMessage || t("jobAlerts.errorLoading")}
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button onClick={() => refetch()} variant="outline">
                {t("common.retry")}
              </Button>
              <Button onClick={() => window.history.back()} variant="ghost">
                {t("common.back")}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">{t("jobAlerts.title")}</h1>
            <p className="text-muted-foreground 400">{t("jobAlerts.description")}</p>
          </div>
        </div>
        
        {/* Save/Cancel buttons */}
        {hasUnsavedChanges && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={componentState.isSaving}
            >
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleSaveAll}
              disabled={componentState.isSaving}
              className="flex items-center gap-2"
            >
              {componentState.isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("common.save")}
            </Button>
          </div>
        )}
      </div>

      {/* Success indicator when saved */}
      {!hasUnsavedChanges && preferences && (
        <Alert className="border-green-200 bg-green-50 950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 200">
            {t("jobAlerts.allChangesSaved")}
          </AlertDescription>
        </Alert>
      )}

      {/* Error alert */}
      {componentState.hasError && componentState.errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {componentState.errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Settings Card */}
      <Card className="feature-card bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("jobAlerts.settingsTitle")}
          </CardTitle>
          <CardDescription>
            {t("jobAlerts.settingsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 950/20 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled" className="text-base font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("jobAlerts.emailEnabled")}
              </Label>
              <p className="text-sm text-gray-500 400">
                {t("jobAlerts.emailEnabledDescription")}
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={formData.emailEnabled}
              onCheckedChange={(checked) => handleFieldUpdate("emailEnabled", checked, true)}
              data-testid="switch-email-enabled"
            />
          </div>

          <Separator />

          {/* Settings Panel - Disabled when email is off */}
          <div 
            className={`space-y-6 transition-opacity duration-200 ${
              formData.emailEnabled ? 'opacity-100' : 'opacity-50'
            }`}
          >
            {/* Email Frequency */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("jobAlerts.frequency")}
              </Label>
              <Select
                value={formData.emailFrequency}
                onValueChange={(value) => handleFieldUpdate("emailFrequency", value as 'instant' | 'daily' | 'weekly')}
                disabled={!formData.emailEnabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("jobAlerts.selectFrequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">{t("jobAlerts.frequencyInstant")}</SelectItem>
                  <SelectItem value="daily">{t("jobAlerts.frequencyDaily")}</SelectItem>
                  <SelectItem value="weekly">{t("jobAlerts.frequencyWeekly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Job Types */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {t("jobAlerts.jobTypes")}
              </Label>
              
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="vast-jobs" className="text-base cursor-pointer">
                      {t("jobAlerts.vastJobs")}
                    </Label>
                    <p className="text-sm text-gray-500 400">
                      {t("jobAlerts.vastJobsDescription")}
                    </p>
                  </div>
                  <Switch
                    id="vast-jobs"
                    checked={formData.vastJobsEnabled}
                    onCheckedChange={(checked) => handleFieldUpdate("vastJobsEnabled", checked)}
                    disabled={!formData.emailEnabled}
                    data-testid="switch-vast-jobs"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="interim-jobs" className="text-base cursor-pointer">
                      {t("jobAlerts.interimJobs")}
                    </Label>
                    <p className="text-sm text-gray-500 400">
                      {t("jobAlerts.interimJobsDescription")}
                    </p>
                  </div>
                  <Switch
                    id="interim-jobs"
                    checked={formData.interimJobsEnabled}
                    onCheckedChange={(checked) => handleFieldUpdate("interimJobsEnabled", checked)}
                    disabled={!formData.emailEnabled}
                    data-testid="switch-interim-jobs"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="uitzenden-jobs" className="text-base cursor-pointer">
                      {t("jobAlerts.uitzendenJobs")}
                    </Label>
                    <p className="text-sm text-gray-500 400">
                      {t("jobAlerts.uitzendenJobsDescription")}
                    </p>
                  </div>
                  <Switch
                    id="uitzenden-jobs"
                    checked={formData.uitzendenjobsEnabled}
                    onCheckedChange={(checked) => handleFieldUpdate("uitzendenjobsEnabled", checked)}
                    disabled={!formData.emailEnabled}
                    data-testid="switch-uitzenden-jobs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("jobAlerts.locationSettings")}
              </Label>
              
              {/* Location Radius */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-radius" className="text-sm">
                    {t("jobAlerts.searchRadius")}: {formData.locationRadius} km
                  </Label>
                  <div className="text-sm text-gray-500">
                    {formData.locationRadius === 0 
                      ? t("jobAlerts.radiusLocal") 
                      : formData.locationRadius >= 100 
                      ? t("jobAlerts.radiusNational") 
                      : t("jobAlerts.radiusRegional")
                    }
                  </div>
                </div>
                <Slider
                  id="location-radius"
                  min={0}
                  max={200}
                  step={10}
                  value={[formData.locationRadius]}
                  onValueChange={([value]) => handleFieldUpdate("locationRadius", value)}
                  disabled={!formData.emailEnabled}
                  className="w-full"
                  data-testid="slider-location-radius"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{t("jobAlerts.radiusLocal")} (0km)</span>
                  <span>{t("jobAlerts.radiusNational")} (200km)</span>
                </div>
              </div>

              {/* Preferred Locations */}
              <div className="space-y-3">
                <Label className="text-sm">{t("jobAlerts.preferredLocations")}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("jobAlerts.addLocationPlaceholder")}
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                    disabled={!formData.emailEnabled}
                    data-testid="input-new-location"
                  />
                  <Button
                    type="button"
                    onClick={addLocation}
                    disabled={!newLocation.trim() || !formData.emailEnabled}
                    size="sm"
                    className="flex items-center gap-2"
                    data-testid="button-add-location"
                  >
                    <Plus className="h-4 w-4" />
                    {t("jobAlerts.addLocation")}
                  </Button>
                </div>
                
                {formData.preferredLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.preferredLocations.map((location, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-1 pr-1"
                        data-testid={`location-badge-${index}`}
                      >
                        <MapPin className="h-3 w-3" />
                        {location}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLocation(location)}
                          disabled={!formData.emailEnabled}
                          className="h-auto w-auto p-1 ml-1 hover:text-red-600 hover:bg-red-50"
                          data-testid={`remove-location-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="feature-card bg-card border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900 100">
                {t("jobAlerts.infoTitle")}
              </h3>
              <p className="text-sm text-blue-800 200">
                {t("jobAlerts.infoDescription")}
              </p>
              <ul className="text-sm text-blue-700 300 space-y-1 ml-4 list-disc">
                <li>{t("jobAlerts.infoPoint1")}</li>
                <li>{t("jobAlerts.infoPoint2")}</li>
                <li>{t("jobAlerts.infoPoint3")}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </PageWrapper>
  );
}