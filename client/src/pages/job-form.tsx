import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Loader2, Eye, MapPin, Briefcase, DollarSign, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/providers/AppProvider";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { insertJobSchema } from "@shared/schema";
import type { InsertJob } from "@shared/types";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown } from "lucide-react";
import { useCanPostJobs } from "@/hooks/use-subscription";
import { PageWrapper } from "@/components/page-wrapper";

// Form schema that handles both strings and empty values - validation messages will be translated
const getJobFormSchema = (t: any) => z.object({
  title: z.string().min(1, t('jobForm.validation.titleRequired')),
  description: z.string().min(10, t('jobForm.validation.descriptionMinLength')),
  location: z.string().min(1, t('jobForm.validation.locationRequired')),
  employmentType: z.enum(['VAST', 'INTERIM', 'UITZENDEN']),
  hourlyRate: z.union([z.string(), z.number()]).optional(),
  salary: z.union([z.string(), z.number()]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  skills: z.string().optional(), // Comma-separated skills string
  status: z.enum(['OPEN', 'PAUSED', 'CLOSED']).optional(),
});

type JobFormData = z.infer<ReturnType<typeof getJobFormSchema>>;

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: "VAST" | "INTERIM" | "UITZENDEN";
  hourlyRate: number | null;
  salary: number | null;
  startDate: string | null;
  endDate: string | null;
  skills?: string[];
  status: "OPEN" | "PAUSED" | "CLOSED";
}

export default function JobFormPage() {
  const { t } = useTranslation();
  const { user } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { id } = useParams<{ id?: string }>();
  
  const isEditing = !!id && id !== "new";
  const { canPost, reason, isLoading: isCheckingSubscription, subscriptionStatus } = useCanPostJobs();
  const [showPreview, setShowPreview] = useState(false);

  // Fetch existing job data for editing
  const { data: existingJob, isLoading: isLoadingJob } = useQuery<Job>({
    queryKey: ["/api/jobs", id],
    queryFn: async () => {
      const response = await apiGet<{ job: Job; user?: any }>(`/api/v2/jobs/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.error || t('jobForm.errors.jobNotFound'));
      }

      return response.data.job; // API returns { job, user }
    },
    enabled: isEditing,
  });

  const form = useForm<JobFormData>({
    resolver: zodResolver(getJobFormSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      employmentType: "VAST",
      salary: "",
      hourlyRate: "",
      startDate: "",
      endDate: "",
      skills: "",
      status: "OPEN",
    },
  });

  // Update form when existing job data is loaded
  useEffect(() => {
    if (existingJob) {
      form.reset({
        title: existingJob.title,
        description: existingJob.description,
        location: existingJob.location,
        employmentType: existingJob.employmentType,
        salary: existingJob.salary?.toString() || "",
        hourlyRate: existingJob.hourlyRate?.toString() || "",
        startDate: existingJob.startDate ? existingJob.startDate.split('T')[0] : "",
        endDate: existingJob.endDate ? existingJob.endDate.split('T')[0] : "",
        skills: existingJob.skills?.join(", ") || "",
        status: existingJob.status,
      });
    }
  }, [existingJob, form]);

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      // Data is already processed in onSubmit, don't process it again
      console.log('CreateJobMutation: Sending data:', data);

      const response = await apiPost<{ job: Job }>('/api/v2/jobs', data);

      if (!response.success || !response.data) {
        console.error('CreateJobMutation: Server error:', response.error);
        throw new Error(response.error || "Failed to create job");
      }

      console.log('CreateJobMutation: Success response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/jobs/my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v2/jobs"] }); // Also invalidate public jobs list
      toast({
        title: t('jobForm.createSuccess'),
        description: t('jobForm.createSuccessDescription'),
      });
      navigate("/my-jobs");
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: any) => {
      // Data is already processed in onSubmit with proper ISO datetime strings
      // No need to convert again, just pass through
      const jobData = {
        ...data,
        status: data.status || "OPEN",
      };

      console.log('UpdateJobMutation: Sending data:', jobData);

      const response = await apiPatch<{ job: Job }>(`/api/v2/jobs/${id}`, jobData);

      if (!response.success || !response.data) {
        console.error('UpdateJobMutation: Server error:', response.error);
        throw new Error(response.error || "Failed to update job");
      }

      console.log('UpdateJobMutation: Success response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/jobs/my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v2/jobs"] }); // Also invalidate public jobs list
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", id] });
      toast({
        title: t('jobForm.updateSuccess'),
        description: t('jobForm.updateSuccessDescription'),
      });
      navigate("/my-jobs");
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const watchEmploymentType = form.watch("employmentType");

  // Reset salary/hourlyRate when employment type changes
  useEffect(() => {
    console.log('Employment type changed to:', watchEmploymentType);
    if (watchEmploymentType === "VAST") {
      console.log('Clearing hourlyRate for VAST');
      form.setValue("hourlyRate", "");
    } else if (watchEmploymentType === "INTERIM" || watchEmploymentType === "UITZENDEN") {
      console.log('Clearing salary for INTERIM/UITZENDEN');
      form.setValue("salary", "");
      // Ensure hourlyRate is properly reset
      const currentHourlyRate = form.getValues("hourlyRate");
      console.log('Current hourlyRate:', currentHourlyRate);
      if (currentHourlyRate === 0 || currentHourlyRate === "0") {
        console.log('Resetting hourlyRate from 0 to empty string');
        form.setValue("hourlyRate", "");
      }
    }
  }, [watchEmploymentType, form]);

  // Helper function to parse salary/rate values (supports ranges like "40000-50000")
  const parseMoneyValue = (value: string | number | undefined): number | null => {
    if (!value || value === "") {return null;}

    // If already a number, return it
    if (typeof value === 'number') {return value;}

    // Handle string values
    const strValue = value.trim();

    // Check if it's a range (e.g., "40000-50000" or "40-50")
    const rangeMatch = strValue.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      // Return the average of the range
      return Math.round((min + max) / 2);
    }

    // Try to parse as single number (handles "50000" or "50.5")
    const parsed = parseFloat(strValue);
    return isNaN(parsed) ? null : parsed;
  };

  const onSubmit = (data: JobFormData) => {
    console.log('onSubmit called with:', data);

    // Convert strings to numbers and dates to ISO format
    const processedData = {
      title: data.title,
      description: data.description,
      location: data.location,
      employmentType: data.employmentType,
      salary: parseMoneyValue(data.salary),
      hourlyRate: parseMoneyValue(data.hourlyRate),
      // Convert YYYY-MM-DD to ISO datetime format (backend expects z.string().datetime())
      // IMPORTANT: Append time to avoid timezone shift bugs
      // Input "2025-11-06" becomes "2025-11-06T00:00:00.000Z" instead of "2025-11-05T23:00:00.000Z" in GMT+1
      startDate: data.startDate ? `${data.startDate}T00:00:00.000Z` : null,
      endDate: data.endDate ? `${data.endDate}T23:59:59.999Z` : null,
      // Convert comma-separated skills string to array
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
      status: data.status || "OPEN",
    };
    
    // Manual validation
    if (data.employmentType === 'VAST' && (!processedData.salary || processedData.salary <= 0)) {
      toast({
        title: "Fout",
        description: "Vast dienstverband vereist een salaris",
        variant: "destructive",
      });
      return;
    }
    
    if ((data.employmentType === 'INTERIM' || data.employmentType === 'UITZENDEN') && 
        (!processedData.hourlyRate || processedData.hourlyRate <= 0)) {
      console.log('Hourly rate validation failed:', {
        employmentType: data.employmentType,
        hourlyRateRaw: data.hourlyRate,
        hourlyRateProcessed: processedData.hourlyRate
      });
      toast({
        title: "Fout", 
        description: "Interim/Uitzenden vereist een uurtarief groter dan 0",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing) {
      updateJobMutation.mutate(processedData as any);
    } else {
      createJobMutation.mutate(processedData as any);
    }
  };

  const handlePreview = () => {
    // Trigger form validation
    form.trigger().then((isValid) => {
      if (isValid) {
        setShowPreview(true);
      } else {
        toast({
          title: "Onvolledige gegevens",
          description: "Vul alle verplichte velden in om een preview te zien",
          variant: "destructive",
        });
      }
    });
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      VAST: "Vast dienstverband",
      INTERIM: "Interim",
      UITZENDEN: "Uitzenden",
    };
    return labels[type] || type;
  };

  const formatSalary = (amount: number | string | null) => {
    if (!amount) {return null;}
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isLoading = createJobMutation.isPending || updateJobMutation.isPending;

  if (!user) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-foreground">{t('auth.loginRequiredTitle')}</h1>
            <p className="text-muted-foreground mb-4">{t('auth.loginRequiredMessage')}</p>
            <Button onClick={() => navigate("/login")}>{t('common.login')}</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (user.userType === 'ZZP' || user.userType === 'SOLLICITANT') {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-foreground">{t('jobForm.noAccess')}</h1>
            <p className="text-muted-foreground mb-4">
              {t('jobForm.noAccessMessage')}
            </p>
            <Button onClick={() => navigate("/jobs")}>{t('jobForm.goToJobs')}</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Check subscription status for BEDRIJF and BUREAU users
  if (isCheckingSubscription) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
            <p className="text-muted-foreground">{t('subscription.checkingStatus')}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Show subscription required message
  if (!canPost && reason === 'SUBSCRIPTION_REQUIRED') {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <Crown className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-foreground">{t('subscription.requiredTitle')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('subscription.requiredMessage')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/subscribe")} className="flex items-center">
                <Crown className="h-4 w-4 mr-2" />
                {t('subscription.startTrial')}
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                {t('common.backToDashboard')}
              </Button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (isEditing && isLoadingJob) {
    return (
      <PageWrapper>
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/my-jobs")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('jobForm.backToMyJobs')}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            {isEditing ? t('jobForm.editJob') : t('jobForm.newJob')}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? t('jobForm.editJobDescription') 
              : t('jobForm.newJobDescription')
            }
          </p>

          {/* Subscription status alert */}
          {subscriptionStatus && !subscriptionStatus.isActive && (
            <Alert className="mt-4 border-amber-200 bg-amber-50">
              <Crown className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Je abonnement is niet actief. Voor het plaatsen of bewerken van vacatures is een actief abonnement vereist.
                <Button 
                  variant="link" 
                  className="p-0 ml-2 h-auto text-amber-600 hover:text-amber-800"
                  onClick={() => navigate("/subscribe")}
                >
                  Activeer nu →
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Form */}
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle>{t('jobForm.jobDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={(e) => {
                console.log('Form submitted event:', e);
                form.handleSubmit(onSubmit, (errors) => {
                  console.log('Form validation failed:', errors);
                })(e);
              }} className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('jobForm.labels.title')} *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('jobForm.placeholders.title')} 
                          {...field} 
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('jobForm.labels.description')} *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('jobForm.placeholders.description')}
                          rows={8}
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('jobForm.labels.location')} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('jobForm.placeholders.location')}
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skills */}
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (optioneel)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv: React, TypeScript, Node.js (gescheiden door komma's)"
                          {...field}
                          data-testid="input-skills"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Employment Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('jobForm.labels.employmentType')} *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "VAST"}
                          defaultValue="VAST"
                          data-testid="select-employment-type"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('jobForm.placeholders.employmentType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VAST">{t('jobs.employmentTypes.VAST')}</SelectItem>
                            <SelectItem value="INTERIM">{t('jobs.employmentTypes.INTERIM')}</SelectItem>
                            <SelectItem value="UITZENDEN">{t('jobs.employmentTypes.UITZENDEN')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status Field - only show during editing */}
                  {isEditing && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('jobForm.labels.status')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "OPEN"}
                            defaultValue="OPEN"
                            data-testid="select-status"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('jobForm.placeholders.status')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OPEN">{t('jobForm.status.open')}</SelectItem>
                              <SelectItem value="PAUSED">{t('jobForm.status.paused')}</SelectItem>
                              <SelectItem value="CLOSED">{t('jobForm.status.closed')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Salary/Hourly Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchEmploymentType === "VAST" ? (
                    <FormField
                      key="salary-field"
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('jobForm.labels.annualSalary')} *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="bijv. 50000 of 40000-60000"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              data-testid="input-salary"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Enkel bedrag of range (bijv. 40000-50000)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      key="hourlyrate-field"
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('jobForm.labels.hourlyRate')} *</FormLabel>
                          <FormControl>
                            <Input
                              key={`hourlyRate-${watchEmploymentType}`}
                              type="text"
                              placeholder="bijv. 75 of 60-90"
                              defaultValue=""
                              onChange={(e) => {
                                const value = e.target.value;
                                console.log('Hourly rate input changed:', value, 'setting to form:', value);
                                form.setValue("hourlyRate", value === "" ? "" : value);
                              }}
                              data-testid="input-hourly-rate"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Enkel bedrag of range (bijv. 60-90)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Start and End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('jobForm.labels.startDate')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-start-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('jobForm.labels.endDate')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={isLoading}
                    data-testid="button-preview"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    data-testid="button-submit"
                    onClick={() => {
                      console.log('Submit button clicked');
                      console.log('Form state:', form.formState);
                      console.log('Form values:', form.getValues());
                    }}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? t('jobForm.saveChanges') : t('jobForm.postJob')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      console.log('Manual test submit');
                      const formData = form.getValues();
                      console.log('Manual form data:', formData);
                      onSubmit(formData);
                    }}
                    disabled={isLoading}
                  >
                    Test Direct
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/my-jobs")}
                    disabled={isLoading}
                    data-testid="button-cancel"
                  >
                    {t('jobForm.cancel')}
                  </Button>

                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vacature Preview</DialogTitle>
            <DialogDescription>
              Zo ziet je vacature eruit voor kandidaten
            </DialogDescription>
          </DialogHeader>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{form.watch("title") || "Vacature Titel"}</CardTitle>
                <Badge variant={form.watch("employmentType") === "VAST" ? "default" : "secondary"}>
                  {getEmploymentTypeLabel(form.watch("employmentType"))}
                </Badge>
              </div>
              <CardDescription className="flex flex-wrap gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {form.watch("location") || "Locatie"}
                </span>
                {form.watch("salary") && form.watch("employmentType") === "VAST" && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(form.watch("salary"))} per jaar
                  </span>
                )}
                {form.watch("hourlyRate") && (form.watch("employmentType") === "INTERIM" || form.watch("employmentType") === "UITZENDEN") && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(form.watch("hourlyRate"))} per uur
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Beschrijving</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {form.watch("description") || "Vacature beschrijving..."}
                </p>
              </div>

              {form.watch("skills") && form.watch("skills").trim().length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Vereiste Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("skills").split(',').map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(form.watch("startDate") || form.watch("endDate")) && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Periode
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {form.watch("startDate") && (
                      <div>Start: {new Date(form.watch("startDate")).toLocaleDateString('nl-NL')}</div>
                    )}
                    {form.watch("endDate") && (
                      <div>Eind: {new Date(form.watch("endDate")).toLocaleDateString('nl-NL')}</div>
                    )}
                  </div>
                </div>
              )}

              {isEditing && (
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge variant={form.watch("status") === "OPEN" ? "default" : "secondary"}>
                    {form.watch("status")}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Sluiten
            </Button>
            <Button onClick={() => {
              setShowPreview(false);
              // Trigger form submission
              form.handleSubmit(onSubmit)();
            }}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Opslaan" : "Plaatsen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
