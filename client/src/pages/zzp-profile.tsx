import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/providers/AppProvider";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Award, User, Briefcase, Euro, Clock, GraduationCap, Building, MapPin, Compass } from "lucide-react";
import { insertZzpProfileSchema } from "@shared/schema";
import type { InsertZzpProfile, ZzpProfile } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
import { PageWrapper } from "@/components/page-wrapper";
import { useTranslation } from "react-i18next";

export default function ZzpProfilePage() {
  const { user } = useApp();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Redirect if not ZZP user
  if (user?.userType !== 'ZZP') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('common.noAccess')}</h1>
            <p className="text-muted-foreground">{t('zzpProfile.accessOnly')}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Fetch ZZP profile
  const { data: profileData, isLoading } = useQuery<{ profile: ZzpProfile | null }>({
    queryKey: ["/api/zzp-profile"],
    queryFn: async () => {
      const response = await apiGet<{ profile: ZzpProfile | null }>("/api/zzp-profile");

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch profile");
      }

      return response.data as { profile: ZzpProfile | null };
    },
    enabled: !!user,
  });

  const profile = profileData?.profile;

  // Form setup
  const form = useForm<InsertZzpProfile>({
    resolver: zodResolver(insertZzpProfileSchema),
    defaultValues: {
      jobTitle: "",
      specialization: "",
      description: "",
      kvkNumber: "",
      hourlyRate: undefined,
      availability: "",
      location: "",
      workRadius: undefined,
      workPreferences: [],
      skills: [],
      experienceYears: undefined,
      education: "",
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        jobTitle: profile.jobTitle || "",
        specialization: profile.specialization || "",
        description: profile.description || "",
        kvkNumber: profile.kvkNumber || "",
        hourlyRate: profile.hourlyRate || undefined,
        availability: profile.availability || "",
        location: profile.location || "",
        workRadius: profile.workRadius || undefined,
        workPreferences: profile.workPreferences || [],
        skills: profile.skills || [],
        experienceYears: profile.experienceYears || undefined,
        education: profile.education || "",
      });
      setSkills(profile.skills || []);
    }
  }, [profile, form]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: InsertZzpProfile) => {
      const response = await apiPost("/api/zzp-profile", { ...data, skills });

      if (!response.success) {
        throw new Error(response.error || "Failed to update profile");
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: t('zzpProfile.toast.updated.title'),
        description: t('zzpProfile.toast.updated.desc'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/zzp-profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: t('zzpProfile.toast.updateError.title'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // File upload functions
  const handleGetUploadParameters = async () => {
    const response = await apiPost<{ uploadURL: string }>("/api/objects/upload", {});

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to get upload URL");
    }

    return {
      method: "PUT" as const,
      url: response.data.uploadURL,
    };
  };

  const handleFileUploadComplete = async (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>,
    fileType: 'cv' | 'certificate'
  ) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      try {
        const response = await apiPatch("/api/zzp-profile/files", {
          fileUrl: uploadedFile.uploadURL,
          fileType,
        });

        if (response.success) {
          toast({
            title: t('zzpProfile.toast.uploaded.title'),
            description: t('zzpProfile.toast.uploaded.desc', { type: fileType === 'cv' ? t('zzpProfile.cv.label') : t('zzpProfile.portfolio.label') }),
          });
          queryClient.invalidateQueries({ queryKey: ["/api/zzp-profile"] });
        } else {
          throw new Error(response.error || "Upload failed");
        }
      } catch (error) {
        toast({
          title: t('zzpProfile.toast.uploadError.title'),
          description: t('zzpProfile.toast.uploadError.desc'),
          variant: "destructive",
        });
      }
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = (data: InsertZzpProfile) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64"></div>
              <Card className="feature-card bg-card">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-48"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded"></div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('zzpProfile.title')}</h1>
              <p className="text-muted-foreground">{t('zzpProfile.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>{t('zzpProfile.basicInfo.title')}</span>
                  </CardTitle>
                  <CardDescription>{t('zzpProfile.basicInfo.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="jobTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('zzpProfile.fields.jobTitle')}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t('zzpProfile.placeholders.jobTitle')} 
                                  {...field} 
                                  data-testid="input-job-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('zzpProfile.fields.specialization')}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t('zzpProfile.placeholders.specialization')} 
                                  {...field} 
                                  data-testid="input-specialization"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('zzpProfile.fields.description')}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t('zzpProfile.placeholders.description')}
                                className="min-h-[120px]"
                                {...field} 
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="kvkNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Building className="h-4 w-4" />
                                <span>{t('zzpProfile.fields.kvkNumber')}</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t('zzpProfile.placeholders.kvkNumber')} 
                                  {...field} 
                                  data-testid="input-kvk-number"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Euro className="h-4 w-4" />
                                <span>{t('zzpProfile.fields.hourlyRate')}</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="75"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  data-testid="input-hourly-rate"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="availability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{t('zzpProfile.fields.availability')}</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t('zzpProfile.placeholders.availability')} 
                                  {...field} 
                                  data-testid="input-availability"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="experienceYears"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jaren ervaring</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="5"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  data-testid="input-experience-years"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4" />
                              <span>Opleiding achtergrond</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Beschrijf je relevante opleidingen, cursussen en certificeringen..."
                                {...field}
                                data-testid="textarea-education"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Location and Work Preferences Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{t('zzpProfile.fields.location')}</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('zzpProfile.placeholders.location')}
                                  {...field}
                                  data-testid="input-location"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="workRadius"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <Compass className="h-4 w-4" />
                                <span>{t('zzpProfile.fields.workRadius')}</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder={t('zzpProfile.placeholders.workRadius')}
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    data-testid="input-work-radius"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    km
                                  </span>
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                {t('zzpProfile.location.radiusHelp')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Work Preferences Checkboxes */}
                      <FormField
                        control={form.control}
                        name="workPreferences"
                        render={() => (
                          <FormItem>
                            <FormLabel>{t('zzpProfile.workPreferences.label')}</FormLabel>
                            <FormDescription className="text-sm text-muted-foreground mb-3">
                              {t('zzpProfile.workPreferences.helpText')}
                            </FormDescription>
                            <div className="space-y-3">
                              <FormField
                                control={form.control}
                                name="workPreferences"
                                render={({ field }) => {
                                  return (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes('INTERIM')}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value || [];
                                            return checked
                                              ? field.onChange([...currentValue, 'INTERIM'])
                                              : field.onChange(currentValue.filter((value) => value !== 'INTERIM'));
                                          }}
                                          data-testid="checkbox-interim"
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {t('zzpProfile.workPreferences.interim')}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                              <FormField
                                control={form.control}
                                name="workPreferences"
                                render={({ field }) => {
                                  return (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes('UITZENDEN')}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value || [];
                                            return checked
                                              ? field.onChange([...currentValue, 'UITZENDEN'])
                                              : field.onChange(currentValue.filter((value) => value !== 'UITZENDEN'));
                                          }}
                                          data-testid="checkbox-uitzenden"
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {t('zzpProfile.workPreferences.uitzenden')}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Skills Section */}
                      <div className="space-y-4">
                        <FormLabel>Vaardigheden</FormLabel>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {skills.map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeSkill(skill)}
                              data-testid={`badge-skill-${index}`}
                            >
                              {skill} ×
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Nieuwe vaardigheid toevoegen"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            data-testid="input-new-skill"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={addSkill}
                            data-testid="button-add-skill"
                          >
                            Toevoegen
                          </Button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        className="w-full"
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? t('zzpProfile.saving') : t('zzpProfile.saveProfile')}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - File Uploads */}
            <div className="space-y-6">
              
              {/* CV Upload */}
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>{t('zzpProfile.cv.title')}</span>
                  </CardTitle>
                  <CardDescription>{t('zzpProfile.cv.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile?.cvUrl ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          {t('zzpProfile.cv.uploaded')}
                        </p>
                      </div>
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5242880} // 5MB
                        allowedFileTypes={['.pdf', '.doc', '.docx']}
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={(result) => handleFileUploadComplete(result, 'cv')}
                        buttonClassName="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t('zzpProfile.cv.replace')}
                      </ObjectUploader>
                    </div>
                  ) : (
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5242880} // 5MB
                      allowedFileTypes={['.pdf', '.doc', '.docx']}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={(result) => handleFileUploadComplete(result, 'cv')}
                      buttonClassName="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t('zzpProfile.cv.upload')}
                      </ObjectUploader>
                  )}
                </CardContent>
              </Card>

              {/* Certificates/Portfolio Upload */}
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>{t('zzpProfile.portfolio.title')}</span>
                  </CardTitle>
                  <CardDescription>{t('zzpProfile.portfolio.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile?.portfolioUrls && profile.portfolioUrls.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {profile.portfolioUrls.length} bestand(en) geüpload
                      </p>
                    </div>
                  )}
                  
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={10485760} // 10MB
                    allowedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={(result) => handleFileUploadComplete(result, 'certificate')}
                    buttonClassName="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('zzpProfile.portfolio.upload')}
                  </ObjectUploader>
                </CardContent>
              </Card>

              {/* Profile Completion Status */}
              <Card className="feature-card bg-card">
                <CardHeader>
                  <CardTitle>{t('zzpProfile.completion.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { label: "Functie/Beroep", completed: !!profile?.jobTitle },
                      { label: "Beschrijving", completed: !!profile?.description },
                      { label: "KvK nummer", completed: !!profile?.kvkNumber },
                      { label: "Uurtarief", completed: !!profile?.hourlyRate },
                      { label: "Woonplaats", completed: !!profile?.location },
                      { label: "Werkstraal", completed: !!profile?.workRadius },
                      { label: "Type werk voorkeur", completed: !!(profile?.workPreferences && profile.workPreferences.length > 0) },
                      { label: "CV upload", completed: !!profile?.cvUrl },
                      { label: "Vaardigheden", completed: !!(profile?.skills && profile.skills.length > 0) },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-sm ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </div>
    </PageWrapper>
  );
}
