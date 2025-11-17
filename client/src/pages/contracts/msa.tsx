import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet, apiPost, apiPatch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Plus, FileCheck, Clock, AlertCircle, CheckCircle2, Building, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface Bureau {
  id: string;
  name: string;
  companyName: string;
  email: string;
}

interface MSAResponse {
  id: string;
  bureau_id: string;
  company_id: string;
  msa_number: string;
  name: string;
  status: string;
  effective_date: string;
  expiration_date: string;
  payment_terms_days: number;
  notice_period_days: number;
  liability_cap?: number;
  auto_renew: boolean;
  contract_type?: 'UITZENDEN' | 'WERVING_SELECTIE' | 'ANDERS';
  msa_document_url?: string;
  signed_document_url?: string;
  company_signed_at?: string;
  company_signed_by?: string;
  bureau_signed_at?: string;
  bureau_signed_by?: string;
  created_at: string;
  updated_at: string;
}

interface MSA {
  id: string;
  bureauId: string;
  bureauName: string;
  msaNumber: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'DRAFT' | 'EXPIRED' | 'TERMINATED' | 'PENDING_REVIEW' | 'PENDING_SIGNATURES' | 'FULLY_SIGNED';
  contractType?: 'UITZENDEN' | 'WERVING_SELECTIE' | 'ANDERS';
  contractValue: number;
  paymentTerms: string;
  msaDocumentUrl?: string;
  signedDocumentUrl?: string;
  companySigned: boolean;
  companySignedAt?: string;
  companySignedBy?: string;
  bureauSigned: boolean;
  bureauSignedAt?: string;
  bureauSignedBy?: string;
  slaTargets: {
    responseTime: number;
    fulfillmentRate: number;
  };
  performance: {
    currentResponseTime: number;
    currentFulfillmentRate: number;
  };
  totalPlacements: number;
  lastReview: string;
}

export default function MSAManagementPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedMSA, setSelectedMSA] = useState<MSA | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMSA, setNewMSA] = useState({
    bureauId: '',
    startDate: '',
    endDate: '',
    paymentTerms: '30',
    contractType: 'UITZENDEN' as 'UITZENDEN' | 'WERVING_SELECTIE' | 'ANDERS',
  });

  // Fetch bureaus for dropdown
  const { data: bureaus = [], isLoading: bureausLoading } = useQuery<Bureau[]>({
    queryKey: ['bureaus'],
    queryFn: async () => {
      const response = await apiGet<{ data: Bureau[] }>('/api/vms/bureaus');
      return response.data || [];
    },
  });

  // Transform backend MSA response to frontend format
  const transformMSA = (msa: MSAResponse): MSA => ({
    id: msa.id,
    bureauId: msa.bureau_id,
    bureauName: bureaus.find(b => b.id === msa.bureau_id)?.companyName || 'Unknown Bureau',
    msaNumber: msa.msa_number,
    startDate: msa.effective_date,
    endDate: msa.expiration_date,
    status: msa.status as MSA['status'],
    contractType: msa.contract_type,
    contractValue: 0, // TODO: Calculate from placements
    paymentTerms: `${msa.payment_terms_days} days`,
    msaDocumentUrl: msa.msa_document_url,
    signedDocumentUrl: msa.signed_document_url,
    companySigned: !!msa.company_signed_at,
    companySignedAt: msa.company_signed_at,
    companySignedBy: msa.company_signed_by,
    bureauSigned: !!msa.bureau_signed_at,
    bureauSignedAt: msa.bureau_signed_at,
    bureauSignedBy: msa.bureau_signed_by,
    slaTargets: {
      responseTime: 24, // Default values - TODO: Get from rate card
      fulfillmentRate: 80,
    },
    performance: {
      currentResponseTime: 0, // TODO: Calculate from metrics
      currentFulfillmentRate: 0,
    },
    totalPlacements: 0, // TODO: Get from placements table
    lastReview: msa.updated_at,
  });

  // Fetch MSAs
  const { data: msas = [], isLoading, error, refetch } = useQuery<MSA[]>({
    queryKey: ['msas', bureaus],
    queryFn: async () => {
      const response = await apiGet<{ data: MSAResponse[] }>('/api/vms/msa');
      return (response.data || []).map(transformMSA);
    },
    enabled: bureaus.length > 0, // Wait for bureaus to load first
  });

  // Create MSA mutation
  const createMSAMutation = useMutation({
    mutationFn: async (msa: typeof newMSA) => {
      const response = await apiPost('/api/vms/msa', {
        companyId: msa.bureauId, // Will be set by backend based on user
        bureauId: msa.bureauId,
        name: `MSA Agreement`,
        effectiveDate: msa.startDate,
        expirationDate: msa.endDate,
        paymentTermsDays: parseInt(msa.paymentTerms),
        contractType: msa.contractType,
        autoRenew: true,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create MSA');
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'MSA created',
        description: 'Master Service Agreement has been created successfully.',
      });
      setNewMSA({ bureauId: '', startDate: '', endDate: '', paymentTerms: '30', contractType: 'UITZENDEN' });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['msas'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create MSA',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Terminate MSA mutation
  const terminateMSAMutation = useMutation({
    mutationFn: async (msaId: string) => {
      const response = await apiPatch(`/api/vms/msa/${msaId}`, { status: 'TERMINATED' });
      if (!response.success) {
        throw new Error(response.error || 'Failed to terminate MSA');
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'MSA terminated',
        description: 'The Master Service Agreement has been terminated.',
      });
      queryClient.invalidateQueries({ queryKey: ['msas'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to terminate MSA',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateMSA = () => {
    if (!newMSA.bureauId || !newMSA.startDate || !newMSA.endDate) {return;}
    createMSAMutation.mutate(newMSA);
  };

  const getContractTypeLabel = (type?: 'UITZENDEN' | 'WERVING_SELECTIE' | 'ANDERS') => {
    switch (type) {
      case 'UITZENDEN':
        return 'Uitzenden';
      case 'WERVING_SELECTIE':
        return 'Werving & Selectie';
      case 'ANDERS':
        return 'Anders';
      default:
        return 'Niet gespecificeerd';
    }
  };

  const getStatusBadgeVariant = (status: MSA['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'DRAFT':
        return 'secondary';
      case 'EXPIRED':
        return 'outline';
      case 'TERMINATED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: MSA['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'DRAFT':
        return <Clock className="h-4 w-4" />;
      case 'EXPIRED':
      case 'TERMINATED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPerformanceStatus = (target: number, current: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) {return { label: 'Excellent', variant: 'default' as const };}
    if (percentage >= 80) {return { label: 'Good', variant: 'default' as const };}
    if (percentage >= 60) {return { label: 'Fair', variant: 'secondary' as const };}
    return { label: 'Poor', variant: 'destructive' as const };
  };

  const activeMSAs = msas.filter((m) => m.status === 'ACTIVE');
  const otherMSAs = msas.filter((m) => m.status !== 'ACTIVE');

  const stats = {
    active: activeMSAs.length,
    pending: msas.filter((m) => m.status === 'DRAFT').length,
    expired: msas.filter((m) => m.status === 'EXPIRED').length,
    totalValue: msas.reduce((sum, m) => sum + m.contractValue, 0),
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('navigation.msaManagement')}</h1>
          <p className="text-muted-foreground">{t('msa.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={bureausLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {t('msa.new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('msa.createTitle')}</DialogTitle>
              <DialogDescription>{t('msa.createDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('msa.labels.bureau')}</label>
                <Select
                  value={newMSA.bureauId}
                  onValueChange={(value) =>
                    setNewMSA({ ...newMSA, bureauId: value })
                  }
                  disabled={bureausLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={bureausLoading ? t('msa.loadingBureaus') : t('msa.selectBureau')} />
                  </SelectTrigger>
                  <SelectContent>
                    {bureaus.length === 0 ? (
                      <SelectItem value="none" disabled>{t('msa.noBureaus')}</SelectItem>
                    ) : (
                      bureaus.map((bureau) => (
                        <SelectItem key={bureau.id} value={bureau.id}>
                          {bureau.companyName || bureau.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('msa.labels.startDate')}</label>
                  <Input
                    type="date"
                    value={newMSA.startDate}
                    onChange={(e) =>
                      setNewMSA({ ...newMSA, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('msa.labels.endDate')}</label>
                  <Input
                    type="date"
                    value={newMSA.endDate}
                    onChange={(e) =>
                      setNewMSA({ ...newMSA, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contract Type</label>
                <Select
                  value={newMSA.contractType}
                  onValueChange={(value: 'UITZENDEN' | 'WERVING_SELECTIE' | 'ANDERS') =>
                    setNewMSA({ ...newMSA, contractType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UITZENDEN">Uitzenden (Temporary Staffing)</SelectItem>
                    <SelectItem value="WERVING_SELECTIE">Werving & Selectie (Recruitment)</SelectItem>
                    <SelectItem value="ANDERS">Anders (Other Services)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('msa.labels.paymentTermsDays')}</label>
                <Select
                  value={newMSA.paymentTerms}
                  onValueChange={(value) =>
                    setNewMSA({ ...newMSA, paymentTerms: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="45">45 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewMSA({ bureauId: '', startDate: '', endDate: '', paymentTerms: '30', contractType: 'UITZENDEN' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMSA}
                disabled={
                  !newMSA.bureauId || !newMSA.startDate || !newMSA.endDate || createMSAMutation.isPending
                }
              >
                Create MSA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show error alert if API fails */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading MSAs</AlertTitle>
          <AlertDescription>
            Failed to load Master Service Agreements. Please try again or contact support if the problem persists.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Active MSAs
            </CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Expired
            </CardDescription>
            <CardTitle className="text-3xl">{stats.expired}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Contract Value</CardDescription>
            <CardTitle className="text-3xl">
              €{(stats.totalValue / 1000).toFixed(0)}k
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* MSAs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Master Service Agreements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active ({activeMSAs.length})</TabsTrigger>
              <TabsTrigger value="other">Other ({otherMSAs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {isLoading || bureausLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activeMSAs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active MSAs</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a Master Service Agreement with a recruitment bureau to get started
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} disabled={bureausLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create MSA
                  </Button>
                </div>
              ) : (
                activeMSAs.map((msa) => {
                  const responseStatus = getPerformanceStatus(
                    msa.slaTargets.responseTime,
                    msa.performance.currentResponseTime
                  );
                  const fulfillmentStatus = getPerformanceStatus(
                    msa.slaTargets.fulfillmentRate,
                    msa.performance.currentFulfillmentRate
                  );

                  return (
                    <Card key={msa.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Building className="h-5 w-5" />
                              {msa.bureauName}
                            </CardTitle>
                            <CardDescription className="space-y-1">
                              <div>
                                {new Date(msa.startDate).toLocaleDateString()} -{' '}
                                {new Date(msa.endDate).toLocaleDateString()}
                              </div>
                              {msa.contractType && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getContractTypeLabel(msa.contractType)}
                                  </Badge>
                                </div>
                              )}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusBadgeVariant(msa.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(msa.status)}
                              {msa.status.toUpperCase()}
                            </span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Contract Details */}
                          <div>
                            <h4 className="font-semibold mb-3 text-sm">Contract Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Value:</span>
                                <span className="font-medium">€{msa.contractValue.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Terms:</span>
                                <span className="font-medium">{msa.paymentTerms}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Placements:</span>
                                <span className="font-medium">{msa.totalPlacements}</span>
                              </div>
                            </div>
                          </div>

                          {/* SLA Targets */}
                          <div>
                            <h4 className="font-semibold mb-3 text-sm">SLA Targets</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-muted-foreground">Response Time:</span>
                                  <Badge variant={responseStatus.variant}>{responseStatus.label}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {msa.performance.currentResponseTime}h / {msa.slaTargets.responseTime}h target
                                </p>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-muted-foreground">Fulfillment Rate:</span>
                                  <Badge variant={fulfillmentStatus.variant}>{fulfillmentStatus.label}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {msa.performance.currentFulfillmentRate}% / {msa.slaTargets.fulfillmentRate}% target
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div>
                            <h4 className="font-semibold mb-3 text-sm">Actions</h4>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setLocation(`/contracts/msa/${msa.id}`)}
                              >
                                <FileCheck className="h-3 w-3 mr-2" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <Shield className="h-3 w-3 mr-2" />
                                Review SLA
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  if (confirm('Are you sure you want to terminate this MSA?')) {
                                    terminateMSAMutation.mutate(msa.id);
                                  }
                                }}
                              >
                                Terminate MSA
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                              Last reviewed: {new Date(msa.lastReview).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="other" className="space-y-4 mt-6">
              {otherMSAs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No other MSAs</h3>
                  <p className="text-sm text-muted-foreground">
                    Pending, expired, and terminated MSAs will appear here
                  </p>
                </div>
              ) : (
                otherMSAs.map((msa) => (
                  <Card key={msa.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{msa.bureauName}</CardTitle>
                          <CardDescription>
                            {new Date(msa.startDate).toLocaleDateString()} -{' '}
                            {new Date(msa.endDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(msa.status)}>
                          {msa.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">€{msa.contractValue.toLocaleString()}</span>
                          {' '} • {' '}
                          <span>{msa.totalPlacements} placements</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/contracts/msa/${msa.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
