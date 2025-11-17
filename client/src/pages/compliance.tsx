import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Clock,
  TrendingUp,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface ComplianceMetric {
  id: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  score: number;
  lastChecked: string;
  details: string;
}

interface ComplianceStats {
  overallScore: number;
  compliantCount: number;
  warningCount: number;
  nonCompliantCount: number;
  totalChecks: number;
  lastAudit: string;
  nextAudit: string;
}

export default function ComplianceDashboardPage() {
  const { t } = useTranslation();
  // Fetch compliance metrics
  const { data: metrics = [], isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useQuery<ComplianceMetric[]>({
    queryKey: ['compliance-metrics'],
    queryFn: async () => {
      const response = await apiGet<ComplianceMetric[]>('/api/vms/compliance');
      return response.data || [];
    },
  });

  // Fetch compliance stats
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<ComplianceStats>({
    queryKey: ['compliance-stats'],
    queryFn: async () => {
      const response = await apiGet<ComplianceStats>('/api/vms/compliance/stats');
      return response.data!;
    },
  });

  const isLoading = metricsLoading || statsLoading;
  const error = metricsError || statsError;

  const getStatusIcon = (status: ComplianceMetric['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'non_compliant':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: ComplianceMetric['status']) => {
    switch (status) {
      case 'compliant':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'non_compliant':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {return 'text-green-500';}
    if (score >= 60) {return 'text-yellow-500';}
    return 'text-red-500';
  };

  const categories = [...new Set(metrics.map((m) => m.category))];

  const gdprMetrics = metrics.filter((m) => m.category === 'GDPR');
  const wcagMetrics = metrics.filter((m) => m.category === 'WCAG');
  const securityMetrics = metrics.filter((m) => m.category === 'Security');
  const dataMetrics = metrics.filter((m) => m.category === 'Data Protection');

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('compliance.errors.loadTitle')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message || t('compliance.errors.loadDescription')}</span>
            <Button onClick={() => { refetchMetrics(); refetchStats(); }} variant="outline" size="sm" className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('vmsAnalytics.errors.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('navigation.complianceDashboard')}</h1>
          <p className="text-muted-foreground">{t('compliance.subtitle')}</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          {t('vmsAnalytics.actions.export')}
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="mb-8 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{t('compliance.overallScore')}</CardTitle>
              <CardDescription>
                {t('compliance.lastAudit')}: {stats?.lastAudit ? new Date(stats.lastAudit).toLocaleDateString() : 'N/A'}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className={`text-5xl font-bold ${getScoreColor(stats?.overallScore || 0)}`}>
                {stats?.overallScore || 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('compliance.nextAudit')}: {stats?.nextAudit ? new Date(stats.nextAudit).toLocaleDateString() : 'TBD'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={stats?.overallScore || 0} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-green-500">
                  {stats?.compliantCount || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{t('compliance.status.compliant')}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-500">
                  {stats?.warningCount || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{t('compliance.status.warnings')}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-2xl font-bold text-red-500">
                  {stats?.nonCompliantCount || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{t('compliance.status.nonCompliant')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('compliance.checksTitle')}
          </CardTitle>
          <CardDescription>
            {t('compliance.checksDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({metrics.length})</TabsTrigger>
              <TabsTrigger value="gdpr">GDPR ({gdprMetrics.length})</TabsTrigger>
              <TabsTrigger value="wcag">WCAG ({wcagMetrics.length})</TabsTrigger>
              <TabsTrigger value="security">Security ({securityMetrics.length})</TabsTrigger>
              <TabsTrigger value="data">Data ({dataMetrics.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : metrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No compliance metrics available</h3>
                  <p className="text-sm text-muted-foreground">
                    Compliance checks will appear here once configured
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(metric.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{metric.requirement}</p>
                            <Badge variant="outline" className="text-xs">
                              {metric.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {metric.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last checked: {new Date(metric.lastChecked).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Score: {metric.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusBadgeVariant(metric.status)}>
                          {metric.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                          {metric.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {[
              { key: 'gdpr', metrics: gdprMetrics },
              { key: 'wcag', metrics: wcagMetrics },
              { key: 'security', metrics: securityMetrics },
              { key: 'data', metrics: dataMetrics },
            ].map(({ key, metrics: categoryMetrics }) => (
              <TabsContent key={key} value={key} className="space-y-4 mt-6">
                {categoryMetrics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No {key.toUpperCase()} metrics available</h3>
                    <p className="text-sm text-muted-foreground">
                      {key.toUpperCase()} compliance checks will appear here once configured
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(metric.status)}
                          <div className="flex-1">
                            <p className="font-semibold mb-1">{metric.requirement}</p>
                            <p className="text-sm text-muted-foreground mb-2">
                              {metric.details}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last checked: {new Date(metric.lastChecked).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Score: {metric.score}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusBadgeVariant(metric.status)}>
                            {metric.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                            {metric.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Recommended Actions
          </CardTitle>
          <CardDescription>
            Priority actions to improve compliance score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics
              .filter((m) => m.status !== 'compliant')
              .sort((a, b) => a.score - b.score)
              .slice(0, 5)
              .map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <p className="font-medium">{metric.requirement}</p>
                      <p className="text-sm text-muted-foreground">{metric.category}</p>
                    </div>
                  </div>
                  <Button size="sm">Take Action</Button>
                </div>
              ))}
            {metrics.filter((m) => m.status !== 'compliant').length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Fully Compliant!</p>
                <p className="text-sm text-muted-foreground">
                  All compliance requirements are met.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
