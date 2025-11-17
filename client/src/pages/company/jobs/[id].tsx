/**
 * Company Job Detail Page with Distribution Management
 *
 * This page is specifically for company users to manage their job postings,
 * including distribution to bureaus.
 *
 * Route: /company/jobs/:id
 * Uses Wouter for routing (NOT Next.js)
 */

import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { JobDistributionManager } from '@/components/jobs/JobDistributionManager';
import { useAuth } from '@/hooks/use-auth';
import { apiGet } from '@/lib/api-client';
import type { Job, User as UserType } from '@shared/types';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Euro,
  Clock,
  Building,
  Users,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

interface JobDetailData {
  job: Job;
  user: UserType;
}

export default function CompanyJobDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');

  // Fetch job data
  const {
    data: jobData,
    isLoading,
    error,
  } = useQuery<JobDetailData>({
    queryKey: [`/api/v2/jobs/${id}`],
    queryFn: async () => {
      const response = await apiGet<JobDetailData>(`/api/v2/jobs/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Job not found');
      }

      return response.data;
    },
    enabled: !!id,
  });

  // Only company users can access this page
  if (user && user.userType !== 'COMPANY') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Deze pagina is alleen toegankelijk voor bedrijven.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => setLocation('/jobs')}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar vacatures
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error || !jobData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Vacature niet gevonden'}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => setLocation('/company/jobs')}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar mijn vacatures
        </Button>
      </div>
    );
  }

  const { job } = jobData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => setLocation('/company/jobs')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar mijn vacatures
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge>{job.status}</Badge>
              <Badge variant="outline">{job.employmentType}</Badge>
            </div>
          </div>

          <Button onClick={() => setLocation(`/company/jobs/${id}/edit`)}>
            Vacature bewerken
          </Button>
        </div>
      </div>

      {/* Job Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vacature Overzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Locatie</div>
                <div className="font-semibold">{job.location}</div>
              </div>
            </div>

            {job.salaryRange && (
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Salaris</div>
                  <div className="font-semibold">{job.salaryRange}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-semibold">{job.employmentType}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Gepubliceerd
                </div>
                <div className="font-semibold">
                  {new Date(job.createdAt).toLocaleDateString('nl-NL')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">
            <Building className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <Users className="h-4 w-4 mr-2" />
            Distributie
          </TabsTrigger>
          <TabsTrigger value="applications">
            <Users className="h-4 w-4 mr-2" />
            Sollicitaties
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Functiebeschrijving</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>

          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Vereisten</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </CardContent>
            </Card>
          )}

          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Wat bieden wij</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.benefits }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <JobDistributionManager jobId={id!} />
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Sollicitaties</CardTitle>
              <CardDescription>
                Overzicht van alle ontvangen sollicitaties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Sollicitaties overzicht wordt binnenkort toegevoegd
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Vacature Analytics</CardTitle>
              <CardDescription>
                Statistieken en prestaties van deze vacature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Analytics dashboard wordt binnenkort toegevoegd
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
