import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApp } from "@/providers/AppProvider";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Edit,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  X,
  Save,
  Briefcase,
  Award,
  FileText,
  MapPin,
  Compass,
  Euro
} from "lucide-react";
import { useLocation } from "wouter";
import { updateProfileSchema, changePasswordSchema } from "@shared/schema";
import { getUserTypeLabel, getInitials, formatDate, requiresCompanyName } from "@/lib/auth";
import type { UpdateProfile, ChangePassword } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { PageWrapper } from "@/components/page-wrapper";

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateProfile, isLoading } = useApp();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // CV Management queries
  const { data: cvData } = useQuery<{ cvUrl?: string }>({
    queryKey: ["/api/cv"],
  });
  
  const uploadCvMutation = useMutation({
    mutationFn: async (cvUrl: string) => {
      const response = await apiPatch<{ success: boolean }>('/api/cv', { cvUrl });

      if (!response.success) {
        throw new Error(response.error || t('profile.errorUploadCV'));
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv"] });
    },
  });
  
  const deleteCvMutation = useMutation({
    mutationFn: async () => {
      const response = await apiDelete<{ success: boolean }>('/api/cv');

      if (!response.success) {
        throw new Error(response.error || t('profile.errorDeleteCV'));
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv"] });
    },
  });

  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch('/api/auth/profile-picture', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload mislukt');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update user context with new profile picture URL
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      window.location.reload(); // Reload to update user context
    },
  });

  // Profile picture delete mutation
  const deleteProfilePictureMutation = useMutation({
    mutationFn: async () => {
      const response = await apiDelete<{ success: boolean }>('/api/auth/profile-picture');

      if (!response.success) {
        throw new Error(response.error || 'Verwijderen mislukt');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      window.location.reload(); // Reload to update user context
    },
  });

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {return;}

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Alleen JPEG, PNG en WebP afbeeldingen zijn toegestaan');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Afbeelding moet kleiner zijn dan 5MB');
      return;
    }

    uploadProfilePictureMutation.mutate(file);
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  const profileForm = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      companyName: typeof user.companyName === 'string' ? user.companyName : "",
      notificationEmail: typeof user.notificationEmail === 'string' ? user.notificationEmail : "",
      // Bureau-specific fields
      serviceType: user.serviceType || undefined,
      nenCertified: user.nenCertified || false,
      waadiCertified: user.waadiCertified || false,
      jobNotificationEmail: typeof user.jobNotificationEmail === 'string' ? user.jobNotificationEmail : "",
      // SOLLICITANT-specific fields
      jobTitle: user.jobTitle || "",
      specialization: user.specialization || "",
      cvUrl: user.cvUrl || "",
      skills: user.skills || [],
      experienceYears: user.experienceYears || undefined,
      location: user.location || "",
      workRadius: user.workRadius || undefined,
      workPreferences: user.workPreferences || [],
      monthlySalaryMin: user.monthlySalaryMin || undefined,
      monthlySalaryMax: user.monthlySalaryMax || undefined,
      annualSalaryMin: user.annualSalaryMin || undefined,
      annualSalaryMax: user.annualSalaryMax || undefined,
    },
  });

  const passwordForm = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const showCompanyName = requiresCompanyName(user.userType);

  const onProfileSubmit = async (data: UpdateProfile) => {
    const success = await updateProfile(data);
    if (success) {
      setIsEditing(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePassword) => {
    try {
      const response = await apiPatch<{ success: boolean }>('/api/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        passwordForm.reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const cancelEdit = () => {
    profileForm.reset({
      name: user.name,
      companyName: typeof user.companyName === 'string' ? user.companyName : "",
      notificationEmail: typeof user.notificationEmail === 'string' ? user.notificationEmail : "",
      // Bureau-specific fields
      serviceType: user.serviceType || undefined,
      nenCertified: user.nenCertified || false,
      waadiCertified: user.waadiCertified || false,
      jobNotificationEmail: typeof user.jobNotificationEmail === 'string' ? user.jobNotificationEmail : "",
      // SOLLICITANT-specific fields
      jobTitle: user.jobTitle || "",
      specialization: user.specialization || "",
      cvUrl: user.cvUrl || "",
      skills: user.skills || [],
      experienceYears: user.experienceYears || undefined,
      location: user.location || "",
      workRadius: user.workRadius || undefined,
      workPreferences: user.workPreferences || [],
      monthlySalaryMin: user.monthlySalaryMin || undefined,
      monthlySalaryMax: user.monthlySalaryMax || undefined,
      annualSalaryMin: user.annualSalaryMin || undefined,
      annualSalaryMax: user.annualSalaryMax || undefined,
    });
    setIsEditing(false);
  };

  return (
    <PageWrapper>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('profile.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('profile.personalInfo')}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  data-testid="button-edit-profile"
                >
                  {isEditing ? <X className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
{isEditing ? t('profile.cancel') : t('profile.edit')}
                </Button>
              </CardHeader>
              
              <CardContent>
                {!isEditing ? (
                  /* View Mode */
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16">
                          {user.profilePictureUrl && (
                            <AvatarImage src={user.profilePictureUrl} alt={user.name} />
                          )}
                          <AvatarFallback className="bg-primary-500 text-white text-2xl font-bold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          <label htmlFor="profile-picture-upload" className="cursor-pointer">
                            <div className="w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors shadow-lg">
                              <Upload className="h-4 w-4 text-white" />
                            </div>
                            <input
                              id="profile-picture-upload"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="hidden"
                              onChange={handleProfilePictureUpload}
                              disabled={uploadProfilePictureMutation.isPending}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 " data-testid="text-profile-name">
                          {user.name}
                        </h3>
                        <p className="text-gray-600 400" data-testid="text-profile-email">
                          {user.email}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {getUserTypeLabel(user.userType)}
                        </Badge>
                        {user.profilePictureUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteProfilePictureMutation.mutate()}
                            disabled={deleteProfilePictureMutation.isPending}
                          >
                            {deleteProfilePictureMutation.isPending ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Verwijderen...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3 mr-1" />
                                Profielfoto verwijderen
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 300 mb-1">
                          {t('profile.fullName')}
                        </label>
                        <p className="text-gray-900 " data-testid="text-display-name">
                          {user.name}
                        </p>
                      </div>
                      
                      {showCompanyName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 300 mb-1">
                            {t('profile.companyName')}
                          </label>
                          <p className="text-gray-900 " data-testid="text-display-company">
                            {user.companyName || t('profile.notSpecified')}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 300 mb-1">
                          {t('profile.email')}
                        </label>
                        <p className="text-gray-900 ">{user.email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 300 mb-1">
                          {t('profile.notificationEmail')}
                        </label>
                        <p className="text-gray-900 " data-testid="text-display-notification-email">
                          {user.notificationEmail || t('profile.defaultEmailUsed')}
                        </p>
                      </div>

                      {/* Bureau-specific fields in view mode */}
                      {user.userType === 'BUREAU' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 300 mb-1">
                              <Briefcase className="h-4 w-4 inline mr-1" />
                              Service Type
                            </label>
                            <p className="text-gray-900 ">
                              {user.serviceType === 'WS' ? 'Werving & Selectie' :
                               user.serviceType === 'UITZENDEN_DETACHEREN' ? 'Uitzenden/Detacheren' :
                               'Niet ingevuld'}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 300 mb-1">
                              <Award className="h-4 w-4 inline mr-1" />
                              Certificeringen
                            </label>
                            <div className="space-y-1">
                              {user.nenCertified && (
                                <Badge variant="secondary" className="mr-2">NEN 4400-1</Badge>
                              )}
                              {user.waadiCertified && (
                                <Badge variant="secondary">WAADI</Badge>
                              )}
                              {!user.nenCertified && !user.waadiCertified && (
                                <p className="text-gray-500 text-sm">Geen certificeringen</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 300 mb-1">
                              Vacature Notificatie Email
                            </label>
                            <p className="text-gray-900 ">
                              {user.jobNotificationEmail || 'Niet ingevuld'}
                            </p>
                          </div>
                        </>
                      )}

                      {/* SOLLICITANT-specific fields in view mode */}
                      {user.userType === 'SOLLICITANT' && (
                        <>
                          {user.jobTitle && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                <Briefcase className="h-4 w-4 inline mr-1" />
                                Gewenste Functie
                              </label>
                              <p className="text-gray-900 ">{user.jobTitle}</p>
                            </div>
                          )}

                          {user.specialization && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                Specialisatie
                              </label>
                              <p className="text-gray-900 ">{user.specialization}</p>
                            </div>
                          )}

                          {/* CV (REQUIRED - always show) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 300 mb-1">
                              <FileText className="h-4 w-4 inline mr-1" />
                              CV (verplicht)
                            </label>
                            {user.cvUrl ? (
                              <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                CV bekijken
                              </a>
                            ) : (
                              <p className="text-red-600">Nog geen CV geüpload</p>
                            )}
                          </div>

                          {/* Skills */}
                          {user.skills && user.skills.length > 0 && (
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                Vaardigheden
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {user.skills.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Experience */}
                          {user.experienceYears && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                Werkervaring
                              </label>
                              <p className="text-gray-900 ">{user.experienceYears} jaar</p>
                            </div>
                          )}

                          {/* Work Preferences (VAST, INTERIM, UITZENDEN - all allowed) */}
                          {user.workPreferences && user.workPreferences.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                Voorkeur Type Werk
                              </label>
                              <div className="flex gap-2 flex-wrap">
                                {user.workPreferences.includes('VAST') && <Badge variant="secondary">Vast</Badge>}
                                {user.workPreferences.includes('INTERIM') && <Badge variant="secondary">Interim</Badge>}
                                {user.workPreferences.includes('UITZENDEN') && <Badge variant="secondary">Uitzenden</Badge>}
                              </div>
                            </div>
                          )}

                          {/* Location & Work Radius */}
                          {user.location && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                Woonplaats
                              </label>
                              <p className="text-gray-900 ">{user.location}</p>
                            </div>
                          )}

                          {user.workRadius && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                <Compass className="h-4 w-4 inline mr-1" />
                                Werkstraal
                              </label>
                              <p className="text-gray-900 ">{user.workRadius} km</p>
                            </div>
                          )}

                          {/* Salary Expectations */}
                          {(user.monthlySalaryMin || user.monthlySalaryMax) && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                <Euro className="h-4 w-4 inline mr-1" />
                                Salarisverwachting (maand bruto)
                              </label>
                              <p className="text-gray-900 ">
                                {user.monthlySalaryMin && `€${user.monthlySalaryMin.toLocaleString()}`}
                                {user.monthlySalaryMin && user.monthlySalaryMax && ' - '}
                                {user.monthlySalaryMax && `€${user.monthlySalaryMax.toLocaleString()}`}
                              </p>
                            </div>
                          )}

                          {(user.annualSalaryMin || user.annualSalaryMax) && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 300 mb-1">
                                Jaarsalaris verwachting
                              </label>
                              <p className="text-gray-900 ">
                                {user.annualSalaryMin && `€${user.annualSalaryMin.toLocaleString()}`}
                                {user.annualSalaryMin && user.annualSalaryMax && ' - '}
                                {user.annualSalaryMax && `€${user.annualSalaryMax.toLocaleString()}`}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 300 mb-1">
                          {t('profile.accountType')}
                        </label>
                        <p className="text-gray-900 ">{getUserTypeLabel(user.userType)}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 300 mb-1">
                          {t('profile.memberSince')}
                        </label>
                        <p className="text-gray-900 ">{formatDate(user.createdAt)}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 300 mb-1">
                          {t('profile.verificationStatus')}
                        </label>
                        <Badge variant={user.isVerified ? "default" : "secondary"}>
                          {user.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t('profile.verified')}
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              {t('profile.pending')}
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit as any)} className="space-y-6" data-testid="form-profile-edit">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control as any}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.fullName')} *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  data-testid="input-edit-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {showCompanyName && (
                          <FormField
                            control={profileForm.control as any}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.companyNameRequired')}</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    data-testid="input-edit-company"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={profileForm.control as any}
                          name="notificationEmail"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>{t('profile.notificationEmailOptional')}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder={t('profile.notificationEmailPlaceholder')}
                                  data-testid="input-edit-notification-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Bureau-specific fields in edit mode */}
                        {user.userType === 'BUREAU' && (
                          <>
                            <FormField
                              control={profileForm.control as any}
                              name="serviceType"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Service Type
                                  </FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      value={field.value || ''}
                                      onValueChange={field.onChange}
                                      className="flex flex-col space-y-2"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="WS" id="ws-edit" />
                                        <Label htmlFor="ws-edit" className="font-normal cursor-pointer">
                                          Werving & Selectie (W&S)
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="UITZENDEN_DETACHEREN" id="uitzenden-edit" />
                                        <Label htmlFor="uitzenden-edit" className="font-normal cursor-pointer">
                                          Uitzenden/Detacheren
                                        </Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="sm:col-span-2 space-y-3">
                              <Label className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Certificeringen
                              </Label>

                              <FormField
                                control={profileForm.control as any}
                                name="nenCertified"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      NEN 4400-1 Gecertificeerd
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={profileForm.control as any}
                                name="waadiCertified"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      WAADI Gecertificeerd
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={profileForm.control as any}
                              name="jobNotificationEmail"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>Vacature Notificatie Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="email"
                                      placeholder="jobs@uwbedrijf.nl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                  <p className="text-sm text-gray-500">
                                    Dedicated email voor vacature notificaties (apart van hoofd email)
                                  </p>
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {/* SOLLICITANT-specific fields in edit mode */}
                        {user.userType === 'SOLLICITANT' && (
                          <>
                            {/* Job Title */}
                            <FormField
                              control={profileForm.control as any}
                              name="jobTitle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    <Briefcase className="h-4 w-4 inline mr-1" />
                                    Gewenste Functie
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Bijv. Frontend Developer" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Specialization */}
                            <FormField
                              control={profileForm.control as any}
                              name="specialization"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specialisatie</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Bijv. React/TypeScript" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* CV Upload (REQUIRED) */}
                            <FormField
                              control={profileForm.control as any}
                              name="cvUrl"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    CV Upload <span className="text-red-600">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="URL naar je CV" />
                                  </FormControl>
                                  <p className="text-sm text-gray-500">
                                    Upload je CV (verplicht) via CV Management sectie hiernaast
                                  </p>
                                  {field.value && (
                                    <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                                      Huidige CV bekijken
                                    </a>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Experience Years */}
                            <FormField
                              control={profileForm.control as any}
                              name="experienceYears"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Werkervaring (jaren)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="Bijv. 5"
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Work Preferences - Checkboxes for VAST, INTERIM, UITZENDEN */}
                            <FormField
                              control={profileForm.control as any}
                              name="workPreferences"
                              render={() => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>Voorkeur Type Werk</FormLabel>
                                  <div className="space-y-2">
                                    <FormField
                                      control={profileForm.control as any}
                                      name="workPreferences"
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes('VAST')}
                                              onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                field.onChange(
                                                  checked
                                                    ? [...current, 'VAST']
                                                    : current.filter((v: string) => v !== 'VAST')
                                                );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">Vaste baan</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={profileForm.control as any}
                                      name="workPreferences"
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes('INTERIM')}
                                              onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                field.onChange(
                                                  checked
                                                    ? [...current, 'INTERIM']
                                                    : current.filter((v: string) => v !== 'INTERIM')
                                                );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">Interim opdrachten</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={profileForm.control as any}
                                      name="workPreferences"
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes('UITZENDEN')}
                                              onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                field.onChange(
                                                  checked
                                                    ? [...current, 'UITZENDEN']
                                                    : current.filter((v: string) => v !== 'UITZENDEN')
                                                );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">Uitzenden/Detacheren</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    Selecteer voor welk type werk je beschikbaar bent (je kunt meerdere selecteren)
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Location & Work Radius */}
                            <FormField
                              control={profileForm.control as any}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    Woonplaats
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Bijv. Amsterdam" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control as any}
                              name="workRadius"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    <Compass className="h-4 w-4 inline mr-1" />
                                    Werkstraal (km)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="Bijv. 50"
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <p className="text-sm text-gray-500">
                                    Hoeveel km van je woonplaats wil je werken?
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Salary Range - Monthly */}
                            <FormField
                              control={profileForm.control as any}
                              name="monthlySalaryMin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    <Euro className="h-4 w-4 inline mr-1" />
                                    Min. Maandsalaris Bruto
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="Bijv. 3000"
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control as any}
                              name="monthlySalaryMax"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max. Maandsalaris Bruto</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="Bijv. 4500"
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Salary Range - Annual */}
                            <FormField
                              control={profileForm.control as any}
                              name="annualSalaryMin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Min. Jaarsalaris</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="Bijv. 36000"
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control as any}
                              name="annualSalaryMax"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max. Jaarsalaris</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="Bijv. 54000"
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          data-testid="button-cancel-edit"
                        >
                          {t('profile.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          data-testid="button-save-profile"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Save className="mr-2 h-4 w-4" />
                          {t('profile.save')}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security & Settings */}
          <div className="space-y-8">
            {/* CV Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {t('profile.cvManagement')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cvData?.cvUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 900/20 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800 200">
                          {t('cv.currentCv')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cvData?.cvUrl && window.open(cvData.cvUrl, '_blank')}
                        className="justify-start"
                        data-testid="button-view-cv"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('cv.download')}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(t('cv.deleteConfirm'))) {
                            deleteCvMutation.mutate();
                          }
                        }}
                        disabled={deleteCvMutation.isPending}
                        className="justify-start text-red-600 hover:text-red-700"
                        data-testid="button-delete-cv"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('cv.delete')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 400">
                        {t('cv.noCv')}
                      </p>
                    </div>
                    
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760} // 10MB
                      allowedFileTypes={['.pdf', '.doc', '.docx']}
                      onGetUploadParameters={async () => {
                        const response = await apiPost<{ uploadURL: string }>('/api/objects/upload', {});

                        if (!response.success || !response.data) {
                          throw new Error(response.error || 'Failed to get upload URL');
                        }

                        return {
                          method: 'PUT' as const,
                          url: response.data.uploadURL,
                        };
                      }}
                      onComplete={(result) => {
                        if (result?.successful && result.successful.length > 0) {
                          const uploadedFile = result.successful[0];
                          if (uploadedFile?.uploadURL) {
                            uploadCvMutation.mutate(uploadedFile.uploadURL);
                          }
                        }
                      }}
                      buttonClassName="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('cv.upload')}
                    </ObjectUploader>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.changePassword')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4" data-testid="form-change-password">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.currentPassword')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder={t('profile.currentPasswordPlaceholder')}
                                data-testid="input-current-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                data-testid="button-toggle-current-password"
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.newPassword')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showNewPassword ? "text" : "password"}
                                placeholder={t('profile.newPasswordPlaceholder')}
                                data-testid="input-new-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                data-testid="button-toggle-new-password"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.confirmNewPassword')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={t('profile.confirmPasswordPlaceholder')}
                                data-testid="input-confirm-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                data-testid="button-toggle-confirm-password"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                      data-testid="button-change-password"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('profile.changePassword')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.accountSettings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 ">{t('profile.emailNotifications')}</h3>
                    <p className="text-xs text-gray-500 400">{t('profile.emailNotificationsDescription')}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-email-notifications" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 ">{t('profile.profileVisibility')}</h3>
                    <p className="text-xs text-gray-500 400">{t('profile.profileVisibilityDescription')}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-profile-visibility" />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 800 feature-card bg-card">
              <CardHeader className="border-b border-red-200 800">
                <CardTitle className="text-red-600 400">{t('profile.dangerZone')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 400 mb-4">
                  {t('profile.deleteAccountWarning')}
                </p>
                <Button variant="destructive" size="sm" data-testid="button-delete-account">
                  {t('profile.deleteAccount')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </PageWrapper>
  );
}
