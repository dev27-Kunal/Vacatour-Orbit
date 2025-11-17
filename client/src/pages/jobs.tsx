import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useApp } from "@/providers/AppProvider";
import { apiGet } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import { useLanguageContext } from "@/context/LanguageContext";
import { Search, Filter, MapPin, Clock, Euro, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/page-wrapper";

interface JobWithUser {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: string;
  employmentType: "VAST" | "INTERIM" | "UITZENDEN";
  hourlyRate: number | null;
  salary: number | null;
  startDate: string | null;
  endDate: string | null;
  status: "OPEN" | "PAUSED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    companyName: string | null;
  };
}

interface JobsResponse {
  jobs: JobWithUser[];
  total: number;
}

interface JobFilters {
  search?: string;
  type?: string[];
  location?: string;
  minRate?: number;
  maxRate?: number;
  status?: string[];
  page: number;
  limit: number;
}

function JobCard({ job }: { job: JobWithUser }) {
  const { user } = useApp();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageContext();
  const [, setLocation] = useLocation();

  const getEmploymentTypeLabel = (type: string) => {
    return t(`jobs.employmentTypes.${type}`);
  };

  const getEmploymentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "VAST": return "default";
      case "INTERIM": return "secondary";
      case "UITZENDEN": return "outline";
      default: return "default";
    }
  };

  const formatSalary = (salary: number | null, hourlyRate: number | null) => {
    if (salary) {
      return `€${salary.toLocaleString()} per jaar`;
    }
    if (hourlyRate) {
      return `€${hourlyRate} per uur`;
    }
    return "Op aanvraag";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Determine if user can apply based on job type and user type
  const canApply = user &&
    (user.userType === 'ZZP' || user.userType === 'ZOEKER') &&
    job.status === 'OPEN' &&
    job.userId !== user.id &&
    (job.employmentType === 'VAST' || job.employmentType === 'INTERIM');

  return (
    <Card className="h-full transition-all hover:shadow-lg feature-card bg-card flex flex-col" data-testid={`card-job-${job.id}`}>
      <Link to={`/jobs/${job.id}`} className="block flex-1 cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
            <Badge variant={getEmploymentTypeBadgeVariant(job.employmentType) as any}>
              {getEmploymentTypeLabel(job.employmentType)}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            {job.user.companyName ? (
              <Building2 className="h-4 w-4 mr-1" />
            ) : (
              <User className="h-4 w-4 mr-1" />
            )}
            {job.user.companyName || job.user.name}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <CardDescription className="line-clamp-3 mb-4">
            {job.description}
          </CardDescription>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Euro className="h-4 w-4 mr-1" />
              {formatSalary(job.salary, job.hourlyRate)}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(job.createdAt)}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Apply Now Button - Always visible for applicable jobs */}
      {canApply && (
        <CardContent className="pt-0 pb-4">
          <Button
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              setLocation(`/jobs/${job.id}`);
            }}
            data-testid={`button-apply-${job.id}`}
          >
            {t('jobs.applyNow')}
          </Button>
        </CardContent>
      )}

      {/* View Details for non-applicable jobs */}
      {!canApply && user && job.status === 'OPEN' && (
        <CardContent className="pt-0 pb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              setLocation(`/jobs/${job.id}`);
            }}
            data-testid={`button-view-details-${job.id}`}
          >
            {t('jobs.viewDetails')}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export default function JobsPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageContext();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
    page: 1,
    limit: 12,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useQuery<JobsResponse>({
    queryKey: ["/api/v2/jobs", filters],
    queryFn: async () => {
      // Build query parameters
      const params: Record<string, any> = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.search) {params.search = filters.search;}
      if (filters.type && filters.type.length > 0) {params.employmentTypes = filters.type.join(',');}
      if (filters.location) {params.location = filters.location;}
      if (filters.minRate !== undefined) {params.minRate = filters.minRate;}
      if (filters.maxRate !== undefined) {params.maxRate = filters.maxRate;}
      if (filters.status && filters.status.length > 0) {params.status = filters.status.join(',');}

      // Use V2 endpoint with session-based API client
      const response = await apiGet<JobsResponse>('/api/v2/jobs', params);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch jobs');
      }

      // Return data from V2 response format
      return response.data || { jobs: [], total: 0 };
    },
  });

  const getMainEmploymentTypeLabel = (type: string) => {
    return t(`jobs.employmentTypes.${type}`);
  };

  const getEmploymentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "VAST": return "default";
      case "INTERIM": return "secondary";
      case "UITZENDEN": return "outline";
      default: return "default";
    }
  };

  const formatMainSalary = (salary: number | null, hourlyRate: number | null) => {
    if (salary) {
      return `€${salary.toLocaleString()} ${t('jobs.salary.perYear')}`;
    }
    if (hourlyRate) {
      return `€${hourlyRate} ${t('jobs.salary.perHour')}`;
    }
    return t('jobs.salary.onRequest');
  };

  const formatMainDate = (dateString: string) => {
    const locale = currentLanguage === 'en' ? 'en-US' : 'nl-NL';
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };


  const handleTypeFilter = (type: string, checked: boolean) => {
    setFilters(prev => {
      const currentTypes = prev.type || [];
      const newTypes = checked 
        ? [...currentTypes, type as any]
        : currentTypes.filter(t => t !== type);
      return { ...prev, type: newTypes.length > 0 ? newTypes : undefined, page: 1 };
    });
  };

  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  if (error) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">{t('common.error')}</h1>
          <p className="text-muted-foreground">{t('jobs.loadError')}</p>
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
          <h1 className="text-3xl font-bold mb-2 text-foreground">{t('jobs.title')}</h1>
          <p className="text-muted-foreground">
            {t('jobs.subtitle')}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('jobs.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('jobs.filters')}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>{t('jobs.filters')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('jobs.employmentTypeLabel')}</Label>
                  <div className="space-y-2">
                    {["VAST", "INTERIM", "UITZENDEN"].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.type?.includes(type as any) || false}
                          onCheckedChange={(checked) => handleTypeFilter(type, checked as boolean)}
                          data-testid={`checkbox-type-${type.toLowerCase()}`}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm">
                          {getMainEmploymentTypeLabel(type)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location-filter" className="text-sm font-medium mb-2 block">{t('jobs.locationLabel')}</Label>
                  <Input
                    id="location-filter"
                    placeholder={t('jobs.locationPlaceholder')}
                    value={filters.location || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined, page: 1 }))}
                    data-testid="input-location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-rate" className="text-sm font-medium mb-2 block">{t('jobs.minRateLabel')}</Label>
                    <Input
                      id="min-rate"
                      type="number"
                      min="0"
                      placeholder="€25"
                      value={filters.minRate || ""}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        // Prevent negative values
                        if (value !== undefined && value < 0) {return;}
                        setFilters(prev => ({
                          ...prev,
                          minRate: value,
                          page: 1
                        }));
                      }}
                      data-testid="input-min-rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-rate" className="text-sm font-medium mb-2 block">{t('jobs.maxRateLabel')}</Label>
                    <Input
                      id="max-rate"
                      type="number"
                      min="0"
                      placeholder="€150"
                      value={filters.maxRate || ""}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        // Prevent negative values
                        if (value !== undefined && value < 0) {return;}
                        setFilters(prev => ({
                          ...prev,
                          maxRate: value,
                          page: 1
                        }));
                      }}
                      data-testid="input-max-rate"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading ? t('common.loading') : t('jobs.resultsCount', { count: data?.total || 0 })}
          </p>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.jobs?.map((job) => (
              <JobCard key={job.id} job={job} />
            )) || []}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              data-testid="button-prev-page"
            >
              {t('common.previous')}
            </Button>
            <div className="flex items-center px-4 py-2">
              {t('jobs.pageInfo', { current: filters.page, total: totalPages })}
            </div>
            <Button
              variant="outline"
              disabled={filters.page === totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              data-testid="button-next-page"
            >
              {t('common.next')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data?.jobs?.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('jobs.noJobsFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('jobs.noJobsMessage')}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({ page: 1, limit: 12 })}
                data-testid="button-clear-filters"
              >
                {t('jobs.clearFilters')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}