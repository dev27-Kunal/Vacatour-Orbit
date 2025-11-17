import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search, Eye, Calendar, Building, User as UserIcon, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Application, Job, User } from "@shared/types";
import { PageWrapper } from "@/components/page-wrapper";
import { apiGet } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

// Application status badge variant mapping
const getStatusVariant = (status: string) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "ACCEPTED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
};

// Application status label mapping
const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return "In behandeling";
    case "ACCEPTED":
      return "Geaccepteerd";
    case "REJECTED":
      return "Afgewezen";
    default:
      return status;
  }
};

// Application fetcher function
type ApplicationWithJob = Application & { 
  job: Job & { 
    user: Pick<User, 'name' | 'companyName'> 
  } 
};

async function fetchMyApplications(): Promise<ApplicationWithJob[]> {
  const response = await apiGet<ApplicationWithJob[]>("/api/v2/applications/my-applications");

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch applications");
  }

  return response.data;
}

export default function MyApplicationsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { t, i18n } = useTranslation();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/applications/my"],
    queryFn: fetchMyApplications,
  });

  if (isLoading) {
    return (
      <PageWrapper>
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
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('myApplications.title', { defaultValue: 'My Applications' })}</h1>
          <p className="text-muted-foreground">{t('myApplications.subtitle', { defaultValue: 'View the status of all your job applications' })}</p>
        </div>

        {/* Filters */}
        <Card className="feature-card bg-card mb-6">
          <CardHeader>
            <CardTitle>{t('myApplications.filters', { defaultValue: 'Filters' })}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('myApplications.searchPlaceholder', { defaultValue: 'Search by company or job title...' })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-applications"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                  <SelectValue placeholder={t('myApplications.filterByStatus', { defaultValue: 'Filter by status' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('myApplications.status.all', { defaultValue: 'All statuses' })}</SelectItem>
                  <SelectItem value="PENDING">{t('myApplications.status.pending', { defaultValue: 'Pending' })}</SelectItem>
                  <SelectItem value="ACCEPTED">{t('myApplications.status.accepted', { defaultValue: 'Accepted' })}</SelectItem>
                  <SelectItem value="REJECTED">{t('myApplications.status.rejected', { defaultValue: 'Rejected' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length === 0 ? (
            <Card className="feature-card bg-card">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Search className="h-12 w-12 !text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{t('myApplications.emptyTitle', { defaultValue: 'No applications found' })}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('myApplications.emptyDesc', { defaultValue: 'You have no applications yet. Start browsing for interesting opportunities!' })}
                  </p>
                  <Link to="/jobs">
                    <Button data-testid="button-browse-jobs">
                      {t('myApplications.browseJobs', { defaultValue: 'Browse Jobs' })}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="feature-card bg-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle 
                        className="text-xl mb-2 cursor-pointer hover:text-blue-600 text-foreground"
                        onClick={() => setLocation(`/jobs/${application.job.id}`)}
                        data-testid={`link-job-${application.job.id}`}
                      >
                        {application.job.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        {application.job.user?.companyName ? (
                          <>
                            <Building className="h-4 w-4 mr-1" />
                            {application.job.user.companyName}
                          </>
                        ) : (
                          <>
                            <UserIcon className="h-4 w-4 mr-1" />
                            {application.job.user?.name || 'Onbekend'}
                          </>
                        )}
                      </div>
                      {application.job.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {application.job.location}
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusVariant(application.status) as any}>
                      {getStatusLabel(application.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.motivation && (
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">Motivatie</h4>
                        <p className="text-sm text-muted-foreground bg-background p-3 rounded">
                          {application.motivation}
                        </p>
                      </div>
                    )}
                    
                    {application.internalNotes && (
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">Bericht van werkgever</h4>
                        <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                          {application.internalNotes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm !text-gray-500">
                        {t('myApplications.submittedOn', { defaultValue: 'Submitted on' })} {new Date(application.createdAt!).toLocaleDateString(i18n.language, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setLocation(`/jobs/${application.job.id}`)}
                        data-testid={`button-view-job-${application.job.id}`}
                      >
                        {t('myApplications.viewJob', { defaultValue: 'View Job' })}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
