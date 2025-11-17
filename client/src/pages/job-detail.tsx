import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Calendar, Euro, Clock, Building, User, Upload, FileText, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Job, User as UserType, InsertApplication } from "@shared/types";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useApp } from "@/providers/AppProvider";
import { apiGet, apiPost } from "@/lib/api-client";
import { PageWrapper } from "@/components/page-wrapper";

// Application form schema for candidate-provided fields only
// Server will add: status, tenantId, applicantId
const applicationFormSchema = z.object({
  jobId: z.string().uuid(),
  candidateName: z.string().min(1, "Naam is verplicht"),
  candidateEmail: z.string().email("Ongeldig e-mailadres"),
  candidatePhone: z.string().optional(),
  motivation: z.string().min(10, "Motivatie moet minimaal 10 karakters bevatten").max(1000, "Motivatie mag maximaal 1000 karakters bevatten"),
  hourlyRate: z.number().positive("Uurtarief moet positief zijn").optional(),
  availability: z.string().min(1, "Beschikbaarheid is verplicht"),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

export default function JobDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const { user } = useApp();

  // Safety check: redirect if no ID
  if (!id) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {t('jobDetail.notFound')}
            </h1>
            <p className="text-muted-foreground mb-4">
              Geen job ID gevonden in de URL
            </p>
            <Button onClick={() => setLocation("/jobs")} data-testid="button-back-to-jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('jobDetail.backToJobs')}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const { data: jobData, isLoading, error } = useQuery<{job: Job; user: UserType}>({
    queryKey: [`/api/v2/jobs/${id}`],
    queryFn: async () => {
      const response = await apiGet<{job: Job; user: UserType}>(`/api/v2/jobs/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Job not found");
      }

      return response.data;
    },
    enabled: !!id,
  });

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      jobId: id || "",
      candidateName: user?.name || "",
      candidateEmail: user?.email || "",
      candidatePhone: "",
      motivation: "",
      availability: "",
    },
  });

  // Handle CV file upload
  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {return;}

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast({
        title: "Ongeldig bestandstype",
        description: "Alleen PDF bestanden zijn toegestaan voor CV upload",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "CV mag maximaal 10MB zijn",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingCv(true);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload mislukt');
      }

      const result = await response.json();

      if (result.files && result.files.length > 0) {
        const uploadedFile = result.files[0];
        setUploadedCvUrl(uploadedFile.url);
        setCvFileName(uploadedFile.originalName);

        toast({
          title: "CV geupload",
          description: `${file.name} is succesvol geupload`,
        });
      } else {
        throw new Error('Geen bestand geretourneerd');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      toast({
        title: "Upload mislukt",
        description: error instanceof Error ? error.message : "Er ging iets mis bij het uploaden van uw CV",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCv(false);
    }
  };

  const createApplicationMutation = useMutation({
    mutationFn: async (data: Partial<InsertApplication>) => {
      const response = await apiPost('/api/v2/applications', data);

      if (!response.success) {
        throw new Error(response.error || 'Fout bij het indienen van reactie');
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Reactie succesvol verzonden!",
        description: "Uw reactie is succesvol ingediend. De werkgever zal contact met u opnemen.",
      });
      setShowApplicationDialog(false);
      form.reset();
      setUploadedCvUrl(null);
      setCvFileName(null);
      queryClient.invalidateQueries({ queryKey: ["/api/v2/applications/my-applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij verzenden reactie",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    const { jobId, motivation, ...restData } = data;

    // Map frontend fields to backend API expectations
    createApplicationMutation.mutate({
      jobId: id!,
      coverLetter: motivation, // Map motivation to coverLetter for API
      resumeUrl: uploadedCvUrl || undefined, // Include uploaded CV URL
      ...restData,
    });
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !jobData) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error ? t('jobDetail.loadError') : t('jobDetail.notFound')}
            </h1>
            <p className="text-muted-foreground mb-4">
              {error ? error.message : t('jobDetail.notFoundDescription')}
            </p>
            <Button onClick={() => setLocation("/jobs")} data-testid="button-back-to-jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('jobDetail.backToJobs')}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const { job, user: jobOwner } = jobData;
  // Apply Now button logic:
  // - VAST (permanent): All individuals (ZZP, ZOEKER) can apply
  // - INTERIM (temporary): All individuals (ZZP, ZOEKER) can apply
  // - UITZENDEN (staffing): Only agencies via bureau portal, no direct applications
  const canApply = user &&
    (user.userType === 'ZZP' || user.userType === 'ZOEKER') &&
    job.status === 'OPEN' &&
    job.userId !== user.id &&
    (job.employmentType === 'VAST' || job.employmentType === 'INTERIM');

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/jobs")}
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar vacatures
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card className="feature-card bg-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2" data-testid="text-job-title">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center text-muted-foreground 400 mb-4">
                    <Building className="mr-2 h-4 w-4" />
                    <span data-testid="text-company-name">
                      {jobOwner.companyName || jobOwner.name}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant={job.status === 'OPEN' ? 'default' : 'secondary'}
                  data-testid="badge-status"
                >
                  {job.status === 'OPEN' ? 'Open' : job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-muted-foreground 400">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span data-testid="text-location">{job.location}</span>
                </div>
                <div className="flex items-center text-muted-foreground 400">
                  <Clock className="mr-2 h-4 w-4" />
                  <span data-testid="text-employment-type">
                    {job.employmentType === 'VAST' && 'Vast dienstverband'}
                    {job.employmentType === 'INTERIM' && 'Interim'}
                    {job.employmentType === 'UITZENDEN' && 'Uitzenden'}
                  </span>
                </div>
                {job.salary && (
                  <div className="flex items-center text-muted-foreground 400">
                    <Euro className="mr-2 h-4 w-4" />
                    <span data-testid="text-salary">€{job.salary.toLocaleString()} per jaar</span>
                  </div>
                )}
                {job.hourlyRate && (
                  <div className="flex items-center text-muted-foreground 400">
                    <Euro className="mr-2 h-4 w-4" />
                    <span data-testid="text-hourly-rate">€{job.hourlyRate} per uur</span>
                  </div>
                )}
                {job.startDate && (
                  <div className="flex items-center text-muted-foreground 400">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span data-testid="text-start-date">
                      Start: {new Date(job.startDate).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Functieomschrijving</h3>
                <div 
                  className="prose  max-w-none"
                  data-testid="text-description"
                >
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application CTA */}
          {user && user.userType === 'ZZP' && job.status === 'OPEN' && job.userId !== user.id && job.employmentType === 'VAST' && (
            <Card className="feature-card bg-card">
              <CardContent className="pt-6">
                <div className="text-center py-4">
                  <p className="text-muted-foreground 400 mb-4">
                    Deze vacature is voor een vast dienstverband en niet geschikt voor ZZP'ers.
                  </p>
                  <Button onClick={() => setLocation("/jobs")} variant="outline" data-testid="button-back-to-jobs">
                    Bekijk andere vacatures
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* UITZENDEN employment type message - only for non-bureau users */}
          {job.employmentType === 'UITZENDEN' && user && user.userType !== 'BUREAU' && (
            <Alert className="feature-card">
              <Info className="h-4 w-4" />
              <AlertTitle>{t('jobs.bureauOnly')}</AlertTitle>
              <AlertDescription>
                {t('jobs.bureauOnlyDescription')}
              </AlertDescription>
            </Alert>
          )}

          {canApply && (
            <Card className="feature-card bg-card">
              <CardHeader>
                <CardTitle>Interesse in deze vacature?</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" data-testid="button-apply">
                      Reageer op vacature
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Reageer op vacature</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="candidateName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Naam *</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-candidate-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="candidateEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-mailadres *</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} data-testid="input-candidate-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="candidatePhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefoonnummer</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-candidate-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* CV Upload Field */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            CV Upload (PDF) *
                          </label>
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleCvUpload}
                              disabled={isUploadingCv}
                              className="flex-1"
                              data-testid="input-cv-upload"
                            />
                            {isUploadingCv && (
                              <span className="text-sm text-muted-foreground">Uploaden...</span>
                            )}
                          </div>
                          {cvFileName && !isUploadingCv && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <FileText className="h-4 w-4" />
                              <span data-testid="text-cv-filename">{cvFileName}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Upload uw CV in PDF formaat (max 10MB)
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="motivation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motivatie *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={4}
                                  placeholder="Vertel waarom u interesse heeft in deze vacature..."
                                  data-testid="textarea-motivation"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {job.employmentType !== 'VAST' && (
                            <FormField
                              control={form.control}
                              name="hourlyRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gewenst uurtarief (€)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                      data-testid="input-hourly-rate"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <FormField
                            control={form.control}
                            name="availability"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beschikbaarheid *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-availability">
                                      <SelectValue placeholder="Selecteer beschikbaarheid" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Per direct">Per direct</SelectItem>
                                    <SelectItem value="Binnen 1 week">Binnen 1 week</SelectItem>
                                    <SelectItem value="Binnen 2 weken">Binnen 2 weken</SelectItem>
                                    <SelectItem value="Binnen 1 maand">Binnen 1 maand</SelectItem>
                                    <SelectItem value="In overleg">In overleg</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowApplicationDialog(false)}
                            data-testid="button-cancel"
                          >
                            Annuleren
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createApplicationMutation.isPending}
                            data-testid="button-submit-application"
                          >
                            {createApplicationMutation.isPending ? "Verzenden..." : "Reactie verzenden"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Contact info */}
          <Card className="feature-card bg-card">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="mr-3 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium" data-testid="text-contact-name">
                      {jobOwner.companyName || jobOwner.name}
                    </p>
                    <p className="text-sm text-muted-foreground 400">
                      {jobOwner.userType === 'BEDRIJF' && 'Bedrijf'}
                      {jobOwner.userType === 'BUREAU' && 'Recruitment Bureau'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posted date */}
          <Card className="feature-card bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground 400">
                Geplaatst op {new Date(job.createdAt!).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </PageWrapper>
  );
}