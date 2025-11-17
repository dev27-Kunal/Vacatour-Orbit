import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateApplicationStatusSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Euro, Search, FileText, Building, Mail, Phone, User, MessageSquare, Eye, CheckCircle, XCircle, Calendar as CalendarIcon, Trophy, Users, Download, ExternalLink } from "lucide-react";
import type { Job, Application, User as UserType } from "@shared/types";
import type { UpdateApplicationStatus } from "@shared/schema";
import { z } from "zod";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/page-wrapper";
import { useLanguageContext } from "@/context/LanguageContext";
import { MSABlockingDialog } from "@/components/msa/MSABlockingDialog";

type ApplicationWithUser = Application & {
  user: Pick<UserType, 'name' | 'email' | 'userType'>
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-800 900 200';
    case 'VIEWED': return 'bg-yellow-100 text-yellow-800 900 200';
    case 'SHORTLIST': return 'bg-green-100 text-green-800 900 200';
    case 'REJECTED': return 'bg-red-100 text-red-800 900 200';
    case 'INTERVIEW': return 'bg-purple-100 text-purple-800 900 200';
    case 'PLACED': return 'bg-emerald-100 text-emerald-800 900 200';
    default: return 'bg-gray-100 text-gray-800 700 200';
  }
};

const getStatusText = (status: string, t: any) => {
  switch (status) {
    case 'NEW': return t('applications.statusNew');
    case 'VIEWED': return t('applications.statusViewed');
    case 'SHORTLIST': return t('applications.statusShortlist');
    case 'REJECTED': return t('applications.statusRejected');
    case 'INTERVIEW': return t('applications.statusInterview');
    case 'PLACED': return t('applications.statusPlaced');
    default: return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'NEW': return <FileText className="h-4 w-4" />;
    case 'VIEWED': return <Eye className="h-4 w-4" />;
    case 'SHORTLIST': return <CheckCircle className="h-4 w-4" />;
    case 'REJECTED': return <XCircle className="h-4 w-4" />;
    case 'INTERVIEW': return <CalendarIcon className="h-4 w-4" />;
    case 'PLACED': return <Trophy className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

export default function ManageApplications() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithUser | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // MSA blocking state
  const [msaBlockingOpen, setMSABlockingOpen] = useState(false);
  const [msaBlockingDetails, setMSABlockingDetails] = useState<{
    companyId: string;
    bureauId: string;
    bureauName: string;
    applicationId: string;
  } | null>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/v2/jobs/my-jobs"],
    queryFn: async () => {
      const response = await apiGet<{ jobs: Job[] } | Job[]>("/api/v2/jobs/my-jobs");

      if (!response.success || !response.data) {
        return [];
      }

      // Handle both response formats: { jobs: [...] } or [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data.jobs || [];
    },
    enabled: !!user && (user.userType === 'BEDRIJF' || user.userType === 'BUREAU'),
  });

  const { data: allApplications = [], isLoading } = useQuery<ApplicationWithUser[]>({
    queryKey: ["/api/v2/applications/all"],
    queryFn: async () => {
      const applicationsData = await Promise.all(
        jobs.map(async (job) => {
          const response = await apiGet<ApplicationWithUser[]>(`/api/v2/jobs/${job.id}/applications`);

          if (response.success && response.data) {
            return response.data.map((app: ApplicationWithUser) => ({ ...app, jobTitle: job.title }));
          }
          return [];
        })
      );
      return applicationsData.flat();
    },
    enabled: jobs.length > 0,
  });

  const form = useForm<UpdateApplicationStatus>({
    resolver: zodResolver(updateApplicationStatusSchema),
    defaultValues: {
      status: 'NEW',
      internalNotes: '',
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApplicationStatus }) => {
      const response = await apiPatch(`/api/v2/applications/${id}`, data);

      if (!response.success || !response.data) {
        throw new Error(response.error || t('errors.general'));
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: t('success.updated'),
        description: t('manageApplications.statusUpdateSuccess'),
      });
      setShowStatusDialog(false);
      setSelectedApplication(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/v2/applications/all"] });
    },
    onError: (error: any) => {
      // Check if this is an MSA blocking error
      if (error?.context?.code === 'NO_ACTIVE_MSA' && selectedApplication) {
        // Find the application to get bureau details
        const application = allApplications.find(app => app.id === selectedApplication.id);

        if (application && application.submittedBy) {
          // Show MSA blocking dialog
          setMSABlockingDetails({
            companyId: error.context.companyId,
            bureauId: error.context.bureauId,
            bureauName: application.user?.name || 'Bureau',
            applicationId: selectedApplication.id,
          });
          setMSABlockingOpen(true);
          setShowStatusDialog(false);
          return;
        }
      }

      // Regular error handling
      toast({
        title: t('errors.general'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startConversationMutation = useMutation({
    mutationFn: async ({ applicationId, message }: { applicationId: string; message?: string }) => {
      const response = await apiPost<{ threadId: string }>(`/api/v2/applications/${applicationId}/start-conversation`, { message });

      if (!response.success || !response.data) {
        throw new Error(response.error || t('errors.general'));
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: t('manageApplications.conversationStarted'),
        description: t('manageApplications.conversationStartedDesc'),
      });
      setLocation(`/messages/${data.threadId}`);
    },
    onError: (error: Error) => {
      toast({
        title: t('errors.general'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitStatus = (data: UpdateApplicationStatus) => {
    if (selectedApplication) {
      updateStatusMutation.mutate({
        id: selectedApplication.id,
        data,
      });
    }
  };

  const filteredApplications = allApplications.filter(app => {
    const matchesSearch = searchTerm === "" ||
      app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app as any).jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesJob = jobFilter === "all" || app.jobId === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Group applications by job
  const applicationsByJob = filteredApplications.reduce((groups, app) => {
    const jobTitle = (app as any).jobTitle || 'Onbekende vacature';
    if (!groups[app.jobId]) {
      groups[app.jobId] = {
        jobTitle,
        applications: []
      };
    }
    groups[app.jobId].applications.push(app);
    return groups;
  }, {} as Record<string, { jobTitle: string; applications: ApplicationWithUser[] }>);

  const openStatusDialog = (application: ApplicationWithUser) => {
    setSelectedApplication(application);
    form.setValue('status', application.status);
    form.setValue('internalNotes', application.internalNotes || '');
    setShowStatusDialog(true);
  };

  // Show loading state while checking authentication
  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check authorization after user data is loaded
  if (!user || (user.userType !== 'BEDRIJF' && user.userType !== 'BUREAU')) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {t('common.noAccess')}
            </h1>
            <p className="text-muted-foreground 400 mb-6">
              {t('manageApplications.noAccessMessage')}
            </p>
            <Button onClick={() => setLocation("/jobs")} data-testid="button-back-to-jobs">
              {t('jobDetail.backToJobs')}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Show loading state for applications data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t('manageApplications.title')}
        </h1>
        <p className="text-muted-foreground 400">
          {t('manageApplications.subtitle')}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {['NEW', 'VIEWED', 'SHORTLIST', 'REJECTED', 'INTERVIEW', 'PLACED'].map((status) => {
          const count = allApplications.filter(app => app.status === status).length;
          return (
            <Card key={status} className="feature-card bg-card text-center">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(status)}
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-gray-500">{getStatusText(status, t)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="feature-card bg-card mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('manageApplications.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger data-testid="select-job-filter">
                  <SelectValue placeholder={t('manageApplications.filterByJob')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('manageApplications.allJobs')}</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title.length > 30 ? `${job.title.substring(0, 30)}...` : job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder={t('manageApplications.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('manageApplications.allStatuses')}</SelectItem>
                  <SelectItem value="NEW">{getStatusText('NEW', t)}</SelectItem>
                  <SelectItem value="VIEWED">{getStatusText('VIEWED', t)}</SelectItem>
                  <SelectItem value="SHORTLIST">{getStatusText('SHORTLIST', t)}</SelectItem>
                  <SelectItem value="REJECTED">{getStatusText('REJECTED', t)}</SelectItem>
                  <SelectItem value="INTERVIEW">{getStatusText('INTERVIEW', t)}</SelectItem>
                  <SelectItem value="PLACED">{getStatusText('PLACED', t)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="feature-card bg-card">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {allApplications.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('manageApplications.noApplications')}
                  </h3>
                  <p className="text-muted-foreground 400 mb-6">
                    {t('manageApplications.noApplicationsMessage')}
                  </p>
                  <Button onClick={() => setLocation("/jobs/new")} data-testid="button-create-job">
                    {t('jobs.createJob')}
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('manageApplications.noResults')}
                  </h3>
                  <p className="text-muted-foreground 400">
                    {t('manageApplications.adjustSearch')}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(applicationsByJob).map(([jobId, jobData]) => (
            <Card key={jobId} className="feature-card bg-card border-l-4 border-l-primary-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {jobData.jobTitle}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground 400 mt-1">
                      {jobData.applications.length} {jobData.applications.length === 1 ? t('manageApplications.application') : t('manageApplications.applications')}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation(`/jobs/${jobId}`)}
                    data-testid={`button-view-job-${jobId}`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('myJobs.view')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobData.applications.map((application) => (
                    <Card key={application.id} className="feature-card bg-card hover:shadow-lg transition-shadow border-l-2 border-l-gray-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg" data-testid={`text-candidate-${application.id}`}>
                          {application.candidateName}
                        </CardTitle>
                        {/* User type badge */}
                        <Badge variant={application.user.userType === 'ZZP' ? 'default' : 'secondary'} 
                               className={application.user.userType === 'ZZP' 
                                 ? 'bg-green-100 text-green-800 900 200' 
                                 : 'bg-blue-100 text-blue-800 900 200'}>
                          {application.user.userType === 'ZZP' ? (
                            <><User className="mr-1 h-3 w-3" /> ZZP'er</>
                          ) : (
                            <><Building className="mr-1 h-3 w-3" /> Bureau</>
                          )}
                        </Badge>
                      </div>
                      <Badge 
                        className={getStatusColor(application.status)}
                        data-testid={`badge-status-${application.id}`}
                      >
                        {getStatusText(application.status, t)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground 400 mb-2">
                      {t('manageApplications.job')}: {(application as any).jobTitle}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground 400">
                      <div className="flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        <span data-testid="text-email">{application.candidateEmail}</span>
                      </div>
                      {application.candidatePhone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          <span data-testid="text-phone">{application.candidatePhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 400">{t('manageApplications.availability')}:</span>
                    <p className="text-sm" data-testid="text-availability">{application.availability}</p>
                  </div>
                  {application.hourlyRate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 400">{t('manageApplications.desiredRate')}:</span>
                      <p className="text-sm" data-testid="text-hourly-rate">€{application.hourlyRate} {t('jobs.salary.perHour')}</p>
                    </div>
                  )}
                </div>

                {application.motivation && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 400">{t('manageApplications.motivation')}:</span>
                    <p className="text-sm mt-1" data-testid="text-motivation">
                      {application.motivation}
                    </p>
                  </div>
                )}

                {application.internalNotes && (
                  <div className="mb-4 p-3 bg-yellow-50 900/20 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800 200">{t('manageApplications.internalNotes')}:</span>
                    <p className="text-sm text-yellow-700 300 mt-1">
                      {application.internalNotes}
                    </p>
                  </div>
                )}

                <div className="flex flex-col space-y-3">
                  <div className="text-sm text-gray-500 400">
                    {t('manageApplications.receivedOn')} {new Date(application.createdAt!).toLocaleDateString(currentLanguage === 'nl' ? 'nl-NL' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => openStatusDialog(application)}
                      data-testid={`button-update-status-${application.id}`}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {t('manageApplications.changeStatus')}
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => startConversationMutation.mutate({ 
                        applicationId: application.id,
                        message: t('manageApplications.defaultMessage', { name: application.candidateName })
                      })}
                      disabled={startConversationMutation.isPending}
                      data-testid={`button-start-conversation-${application.id}`}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('manageApplications.startConversation')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation(`/jobs/${application.jobId}`)}
                      data-testid={`button-view-job-${application.jobId}`}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t('myJobs.view')}
                    </Button>
                    
                    {/* CV button for ZZP users */}
                    {application.user.userType === 'ZZP' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Navigate to public ZZP profile to view CV
                          setLocation(`/public/zzp-profile/${application.applicantId}`);
                        }}
                        data-testid={`button-view-cv-${application.id}`}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {t('cv.preview')}
                      </Button>
                    )}
                    
                    {/* Email contact button */}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        window.open(`mailto:${application.candidateEmail}?subject=${t('manageApplications.emailSubject')}: ${(application as any).jobTitle}`, '_blank');
                      }}
                      data-testid={`button-email-${application.id}`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {t('common.email')}
                    </Button>
                  </div>
                </div>
              </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('manageApplications.changeStatus')}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitStatus)} className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">{t('manageApplications.candidate')}: {selectedApplication.candidateName}</h4>
                  <p className="text-sm text-muted-foreground 400">
                    {selectedApplication.candidateEmail}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('manageApplications.newStatus')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-new-status">
                            <SelectValue placeholder={t('manageApplications.selectNewStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEW">{getStatusText('NEW', t)}</SelectItem>
                          <SelectItem value="VIEWED">{getStatusText('VIEWED', t)}</SelectItem>
                          <SelectItem value="SHORTLIST">{getStatusText('SHORTLIST', t)}</SelectItem>
                          <SelectItem value="REJECTED">{getStatusText('REJECTED', t)}</SelectItem>
                          <SelectItem value="INTERVIEW">{getStatusText('INTERVIEW', t)}</SelectItem>
                          <SelectItem value="PLACED">{getStatusText('PLACED', t)}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="internalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('manageApplications.internalNotesOptional')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder={t('manageApplications.addNotesPlaceholder')}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowStatusDialog(false)}
                    data-testid="button-cancel"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-update-status"
                  >
                    {updateStatusMutation.isPending ? t('common.loading') : t('manageApplications.updateStatus')}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* MSA Blocking Dialog */}
      {msaBlockingDetails && (
        <MSABlockingDialog
          isOpen={msaBlockingOpen}
          onClose={() => {
            setMSABlockingOpen(false);
            setMSABlockingDetails(null);
          }}
          companyId={msaBlockingDetails.companyId}
          bureauId={msaBlockingDetails.bureauId}
          bureauName={msaBlockingDetails.bureauName}
          onMSACreated={async () => {
            // MSA created successfully, close dialog and retry hire
            setMSABlockingOpen(false);

            if (selectedApplication) {
              // Retry the status update to PLACED
              updateStatusMutation.mutate({
                id: msaBlockingDetails.applicationId,
                data: {
                  status: 'PLACED',
                  internalNotes: form.getValues('internalNotes'),
                },
              });
            }

            setMSABlockingDetails(null);
          }}
        />
      )}
      </div>
    </PageWrapper>
  );
}