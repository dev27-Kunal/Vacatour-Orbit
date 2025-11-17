import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/page-wrapper";
import { 
  Bell, 
  Mail, 
  Clock, 
  MapPin, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  Send,
  Calendar,
  ChevronRight,
  Settings,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { nl, enUS } from "date-fns/locale";
import { useApp } from "@/providers/AppProvider";

interface JobAlert {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: 'vast' | 'interim' | 'uitzenden';
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
  emailAddress: string;
  createdAt: string;
}

interface JobAlertStats {
  totalSent: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
}

export default function JobAlerts() {
  const { t, i18n } = useTranslation();
  const { user } = useApp();
  const locale = i18n.language === 'nl' ? nl : enUS;

  // Fetch job alerts history
  const { data: alerts = [], isLoading: alertsLoading } = useQuery<JobAlert[]>({
    queryKey: ["/api/job-alerts"],
    enabled: !!user,
  });

  // Fetch job alert statistics
  const { data: stats, isLoading: statsLoading } = useQuery<JobAlertStats>({
    queryKey: ["/api/job-alerts/stats"],
    enabled: !!user,
  });

  const getJobTypeBadgeVariant = (type: string) => {
    switch(type) {
      case 'vast': return 'default';
      case 'interim': return 'secondary';
      case 'uitzenden': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'sent': return t("jobAlerts.status.sent");
      case 'pending': return t("jobAlerts.status.pending");
      case 'failed': return t("jobAlerts.status.failed");
      default: return status;
    }
  };

  if (alertsLoading || statsLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <div>
                <h1 className="text-3xl font-bold">{t("jobAlerts.historyTitle")}</h1>
                <p className="text-gray-600">{t("common.loading")}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold">{t("jobAlerts.historyTitle")}</h1>
              <p className="text-muted-foreground">{t("jobAlerts.historyDescription")}</p>
            </div>
          </div>
          
          <Link href="/job-alert-preferences">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("jobAlerts.managePreferences")}
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("jobAlerts.stats.total")}</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSent}</div>
                <p className="text-xs text-muted-foreground">
                  {t("jobAlerts.stats.totalDescription")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("jobAlerts.stats.today")}</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sentToday}</div>
                <p className="text-xs text-muted-foreground">
                  {t("jobAlerts.stats.todayDescription")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("jobAlerts.stats.week")}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sentThisWeek}</div>
                <p className="text-xs text-muted-foreground">
                  {t("jobAlerts.stats.weekDescription")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("jobAlerts.stats.month")}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sentThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  {t("jobAlerts.stats.monthDescription")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts List */}
        <Card className="feature-card bg-card">
          <CardHeader>
            <CardTitle>{t("jobAlerts.recentAlerts")}</CardTitle>
            <CardDescription>
              {t("jobAlerts.recentAlertsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("jobAlerts.noAlerts")}</h3>
                <p className="text-gray-600 mb-4">
                  {t("jobAlerts.noAlertsDescription")}
                </p>
                <Link href="/job-alert-preferences">
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("jobAlerts.setupAlerts")}
                  </Button>
                </Link>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">{t("jobAlerts.tabs.all")}</TabsTrigger>
                  <TabsTrigger value="sent">{t("jobAlerts.tabs.sent")}</TabsTrigger>
                  <TabsTrigger value="pending">{t("jobAlerts.tabs.pending")}</TabsTrigger>
                  <TabsTrigger value="failed">{t("jobAlerts.tabs.failed")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4 mt-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(alert.status)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{alert.jobTitle}</h4>
                            <Badge variant={getJobTypeBadgeVariant(alert.jobType)}>
                              {alert.jobType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {alert.companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alert.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {alert.emailAddress}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{getStatusText(alert.status)}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(alert.sentAt), { 
                                addSuffix: true,
                                locale 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/jobs/${alert.jobId}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="sent" className="space-y-4 mt-4">
                  {alerts.filter(a => a.status === 'sent').map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(alert.status)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{alert.jobTitle}</h4>
                            <Badge variant={getJobTypeBadgeVariant(alert.jobType)}>
                              {alert.jobType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {alert.companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alert.location}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(alert.sentAt), { 
                              addSuffix: true,
                              locale 
                            })}
                          </div>
                        </div>
                      </div>
                      <Link href={`/jobs/${alert.jobId}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="pending" className="space-y-4 mt-4">
                  {alerts.filter(a => a.status === 'pending').length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t("jobAlerts.noPendingAlerts")}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    alerts.filter(a => a.status === 'pending').map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        {/* Similar structure as above */}
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="failed" className="space-y-4 mt-4">
                  {alerts.filter(a => a.status === 'failed').length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t("jobAlerts.noFailedAlerts")}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    alerts.filter(a => a.status === 'failed').map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        {/* Similar structure with error styling */}
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}