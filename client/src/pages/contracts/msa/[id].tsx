/**
 * MSA Detail Page
 * Enhanced view with document management and signing workflow
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  Users,
  Clock,
  DollarSign,
  FileSignature,
  Download,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { MSADocumentUpload } from '@/components/contracts/MSADocumentUpload';
import { MSASigningWorkflow } from '@/components/contracts/MSASigningWorkflow';
import { formatters as i18nFormatters } from '@/lib/i18n-formatters';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface MSADetail {
  id: string;
  bureau_id: string;
  company_id: string;
  bureau_name: string;
  company_name: string;
  msa_number: string;
  name: string;
  status: string;
  contract_type?: 'UITZENDEN' | 'WERVING_SELECTIE' | 'ANDERS';
  effective_date: string;
  expiration_date: string;
  payment_terms_days: number;
  notice_period_days: number;
  liability_cap?: number;
  auto_renew: boolean;
  msa_document_url?: string;
  signed_document_url?: string;
  company_signed_at?: string;
  company_signed_by?: string;
  bureau_signed_at?: string;
  bureau_signed_by?: string;
  created_at: string;
  updated_at: string;
}

export default function MSADetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const { t, i18n } = useTranslation();

  const { data: msa, isLoading, error } = useQuery<MSADetail>({
    queryKey: ['msa', id],
    queryFn: async () => {
      const response = await apiGet<{ data: MSADetail }>(`/api/vms/msa/${id}`);
      if (!response.success || !response.data) {
        throw new Error('Failed to load MSA');
      }
      return response.data;
    },
    enabled: !!id,
  });

  const getContractTypeLabel = (type?: 'UITZENDEN' | 'WERVING_SELECTIE' | 'ANDERS') => {
    switch (type) {
      case 'UITZENDEN':
        return t('msa.contractType.uitzenden', { defaultValue: 'Staffing' });
      case 'WERVING_SELECTIE':
        return t('msa.contractType.wervingSelectie', { defaultValue: 'Recruitment' });
      case 'ANDERS':
        return t('msa.contractType.other', { defaultValue: 'Other' });
      default:
        return t('msa.contractType.unspecified', { defaultValue: 'Unspecified' });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { label: t('msa.status.DRAFT', { defaultValue: 'Draft' }), variant: 'secondary' as const, icon: <Clock className="h-4 w-4" /> };
      case 'PENDING_REVIEW':
        return { label: t('msa.status.PENDING_REVIEW', { defaultValue: 'Pending Review' }), variant: 'secondary' as const, icon: <AlertCircle className="h-4 w-4" /> };
      case 'PENDING_SIGNATURES':
        return { label: t('msa.status.PENDING_SIGNATURES', { defaultValue: 'Waiting for Signatures' }), variant: 'default' as const, icon: <FileSignature className="h-4 w-4" /> };
      case 'FULLY_SIGNED':
        return { label: t('msa.status.FULLY_SIGNED', { defaultValue: 'Fully Signed' }), variant: 'default' as const, icon: <CheckCircle className="h-4 w-4" /> };
      case 'ACTIVE':
        return { label: t('msa.status.ACTIVE', { defaultValue: 'Active' }), variant: 'default' as const, icon: <CheckCircle className="h-4 w-4" /> };
      case 'TERMINATED':
        return { label: t('msa.status.TERMINATED', { defaultValue: 'Terminated' }), variant: 'destructive' as const, icon: <AlertCircle className="h-4 w-4" /> };
      default:
        return { label: status, variant: 'secondary' as const, icon: <Clock className="h-4 w-4" /> };
    }
  };

  const handleDocumentUploadSuccess = (documentType: 'unsigned' | 'signed') => {
    toast({
      title: t('msa.toast.uploadTitle', { defaultValue: 'Document uploaded' }),
      description: documentType === 'unsigned' ? t('msa.toast.unsignedUploaded', { defaultValue: 'MSA document uploaded successfully' }) : t('msa.toast.signedUploaded', { defaultValue: 'Signed document uploaded successfully' }),
    });
    queryClient.invalidateQueries({ queryKey: ['msa', id] });
  };

  const handleSigningStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['msa', id] });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !msa) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('common.error', { defaultValue: 'Error' })}</AlertTitle>
          <AlertDescription>
            {t('msa.detail.errorDesc', { defaultValue: 'Failed to load MSA. Please try again or go back to the overview.' })}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/contracts/msa')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('msa.backToOverview', { defaultValue: 'Back to Overview' })}
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(msa.status);

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/contracts/msa')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('msa.backToOverview', { defaultValue: 'Back to Overview' })}
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('msa.detail.title', { defaultValue: 'MSA Details' })}</h1>
            <p className="text-muted-foreground">
              {msa.msa_number} - {msa.name}
            </p>
          </div>
          <Badge variant={statusConfig.variant}>
            <span className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {t('msa.page.company', { defaultValue: 'Company' })}
            </CardDescription>
            <CardTitle className="text-lg">{msa.company_name || 'Unknown'}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('msa.labels.bureau', { defaultValue: 'Bureau' })}
            </CardDescription>
            <CardTitle className="text-lg">{msa.bureau_name || 'Unknown'}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('msa.page.validUntil', { defaultValue: 'Valid Until' })}
            </CardDescription>
            <CardTitle className="text-lg">
              {i18nFormatters.for(i18n.language).formatDate(new Date(msa.expiration_date), 'dd MMM yyyy')}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('msa.page.paymentTerms', { defaultValue: 'Payment Terms' })}
            </CardDescription>
            <CardTitle className="text-lg">{msa.payment_terms_days} {t('common.days', { defaultValue: 'days' })}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('msa.tabs.overview', { defaultValue: 'Overview' })}</TabsTrigger>
          <TabsTrigger value="documents">{t('msa.tabs.documents', { defaultValue: 'Documents' })}</TabsTrigger>
          <TabsTrigger value="signing">{t('msa.tabs.signing', { defaultValue: 'Signing' })}</TabsTrigger>
          <TabsTrigger value="history">{t('msa.tabs.history', { defaultValue: 'History' })}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('msa.page.contractInfo', { defaultValue: 'Contract Information' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('msa.page.msaNumber', { defaultValue: 'MSA Number' })}</p>
                  <p className="font-medium">{msa.msa_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('msa.page.contractType', { defaultValue: 'Contract Type' })}</p>
                  <p className="font-medium">{getContractTypeLabel(msa.contract_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('msa.page.effectiveDate', { defaultValue: 'Effective Date' })}</p>
                  <p className="font-medium">
                    {i18nFormatters.for(i18n.language).formatDate(new Date(msa.effective_date), 'dd MMMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('msa.page.expirationDate', { defaultValue: 'Expiration Date' })}</p>
                  <p className="font-medium">
                    {i18nFormatters.for(i18n.language).formatDate(new Date(msa.expiration_date), 'dd MMMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('msa.page.paymentTerms', { defaultValue: 'Payment Terms' })}</p>
                  <p className="font-medium">{msa.payment_terms_days} {t('common.days', { defaultValue: 'days' })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('msa.page.noticePeriod', { defaultValue: 'Notice Period' })}</p>
                  <p className="font-medium">{msa.notice_period_days} {t('common.days', { defaultValue: 'days' })}</p>
                </div>
                {msa.liability_cap && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('msa.page.liabilityCap', { defaultValue: 'Liability Cap' })}</p>
                    <p className="font-medium">€{msa.liability_cap.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">{t('msa.page.autoRenew', { defaultValue: 'Auto Renew' })}</p>
                  <p className="font-medium">{msa.auto_renew ? t('common.yes', { defaultValue: 'Yes' }) : t('common.no', { defaultValue: 'No' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          <MSADocumentUpload
            msaId={msa.id}
            documentType="unsigned"
            currentDocumentUrl={msa.msa_document_url}
            onUploadSuccess={() => handleDocumentUploadSuccess('unsigned')}
          />

          <MSADocumentUpload
            msaId={msa.id}
            documentType="signed"
            currentDocumentUrl={msa.signed_document_url}
            onUploadSuccess={() => handleDocumentUploadSuccess('signed')}
          />
        </TabsContent>

        {/* Signing Tab */}
        <TabsContent value="signing" className="space-y-6 mt-6">
          <MSASigningWorkflow
            msaId={msa.id}
            msaNumber={msa.msa_number}
            status={msa.status as any}
            companyParty={{
              type: 'company',
              name: msa.company_name || 'Unknown',
              signed: !!msa.company_signed_at,
              signedAt: msa.company_signed_at,
              signedBy: msa.company_signed_by,
            }}
            bureauParty={{
              type: 'bureau',
              name: msa.bureau_name || 'Unknown',
              signed: !!msa.bureau_signed_at,
              signedAt: msa.bureau_signed_at,
              signedBy: msa.bureau_signed_by,
            }}
            currentUserType="BEDRIJF" // TODO: Get from auth context
            onStatusChange={handleSigningStatusChange}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
              <CardHeader>
                <CardTitle>{t('msa.timeline.title', { defaultValue: 'Timeline' })}</CardTitle>
                <CardDescription>{t('msa.timeline.desc', { defaultValue: 'Important events for this MSA' })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {/* Timeline items */}
                <div className="flex gap-4 items-start">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('msa.timeline.created', { defaultValue: 'MSA Created' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {i18nFormatters.for(i18n.language).formatDateTime(msa.created_at, 'dd MMMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>

                {msa.company_signed_at && (
                  <div className="flex gap-4 items-start">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('msa.timeline.signedByCompany', { defaultValue: 'Signed by Company' })}</p>
                      <p className="text-sm text-muted-foreground">
                        {i18nFormatters.for(i18n.language).formatDateTime(msa.company_signed_at, 'dd MMMM yyyy, HH:mm')}
                        {msa.company_signed_by && ` ${t('msa.timeline.by', { defaultValue: 'by' })} ${msa.company_signed_by}`}
                      </p>
                    </div>
                  </div>
                )}

                {msa.bureau_signed_at && (
                  <div className="flex gap-4 items-start">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('msa.timeline.signedByBureau', { defaultValue: 'Signed by Bureau' })}</p>
                      <p className="text-sm text-muted-foreground">
                        {i18nFormatters.for(i18n.language).formatDateTime(msa.bureau_signed_at, 'dd MMMM yyyy, HH:mm')}
                        {msa.bureau_signed_by && ` ${t('msa.timeline.by', { defaultValue: 'by' })} ${msa.bureau_signed_by}`}
                      </p>
                    </div>
                  </div>
                )}

                {msa.updated_at && msa.updated_at !== msa.created_at && (
                  <div className="flex gap-4 items-start">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('msa.timeline.lastUpdated', { defaultValue: 'Last Updated' })}</p>
                      <p className="text-sm text-muted-foreground">
                        {i18nFormatters.for(i18n.language).formatDateTime(msa.updated_at, 'dd MMMM yyyy, HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
