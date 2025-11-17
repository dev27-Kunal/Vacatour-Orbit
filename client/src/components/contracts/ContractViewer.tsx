/**
 * Contract Viewer Component
 * Display and interact with contract details
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { formatters as i18nFormatters } from '@/lib/i18n-formatters';
import {
  FileText,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileSignature,
  User,
  Building,
  Calendar,
  Euro,
  History,
  MessageSquare,
  Send,
  Shield,
  Printer,
  Mail,
  Copy,
  ExternalLink,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiGet, apiPost, ApiError } from '@/lib/api-client';

interface ContractViewerProps {
  contractId: string;
}

interface ContractDetails {
  id: string;
  contract_number: string;
  contract_type: 'VAST' | 'INTERIM' | 'UITZENDEN';
  status: string;

  // Parties
  company_name?: string;
  company_id: string;
  bureau_name?: string;
  bureau_id: string;
  candidate_name?: string;
  candidate_id: string;

  // Job details
  job_title?: string;
  job_id: string;
  application_id: string;

  // Contract details
  start_date: string;
  end_date?: string;
  salary_amount?: number;
  hourly_rate?: number;
  working_hours?: number;
  vacation_days?: number;
  probation_period?: number;
  notice_period?: number;

  // Bureau fees
  bureau_fee_amount?: number;
  fee_calculation_details?: any;

  // Contract content
  contract_html?: string;
  contract_variables?: Record<string, any>;

  // Signatures
  signatures_required: number;
  signatures_received: number;
  contract_signatures?: ContractSignature[];

  // Approvals
  contract_approvals?: ContractApproval[];

  // Audit log
  contract_audit_log?: AuditLog[];

  // Timestamps
  created_at: string;
  approved_at?: string;
  fully_signed_at?: string;
  activated_at?: string;
  terminated_at?: string;
  termination_reason?: string;
}

interface ContractSignature {
  id: string;
  signer_id: string;
  signer_name: string;
  signer_role: string;
  signature_type: string;
  signed_at: string;
  is_valid: boolean;
  signature_data?: any;
}

interface ContractApproval {
  id: string;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  status: string;
  approved_at?: string;
  rejected_at?: string;
  comments?: string;
}

interface AuditLog {
  id: string;
  action: string;
  performed_by_name: string;
  performed_by_role?: string;
  created_at: string;
  changes_json?: any;
}

const statusConfig = {
  DRAFT: { label: 'Concept', variant: 'secondary' as const, icon: Edit },
  PENDING_REVIEW: { label: 'In Review', variant: 'warning' as const, icon: Clock },
  PENDING_APPROVAL: { label: 'Goedkeuring', variant: 'warning' as const, icon: Clock },
  APPROVED: { label: 'Goedgekeurd', variant: 'success' as const, icon: CheckCircle },
  PENDING_SIGNATURE: { label: 'Te Tekenen', variant: 'warning' as const, icon: FileSignature },
  PARTIALLY_SIGNED: { label: 'Deels Getekend', variant: 'warning' as const, icon: FileSignature },
  FULLY_SIGNED: { label: 'Getekend', variant: 'success' as const, icon: CheckCircle },
  ACTIVE: { label: 'Actief', variant: 'success' as const, icon: CheckCircle },
  COMPLETED: { label: 'Voltooid', variant: 'default' as const, icon: CheckCircle },
  CANCELLED: { label: 'Geannuleerd', variant: 'destructive' as const, icon: XCircle },
  TERMINATED: { label: 'Beëindigd', variant: 'destructive' as const, icon: XCircle },
};

export function ContractViewer({ contractId }: ContractViewerProps) {
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationDate, setTerminationDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/v2/contracts/${contractId}`);
      setContract(response.data);
    } catch (error) {
      console.error('Error fetching contract:', error);
      const errorMessage = error instanceof ApiError ? error.message : t('contracts.viewer.loadError', { defaultValue: 'Failed to load contract' });
      toast({
        title: t('common.error', { defaultValue: 'Error' }),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    try {
      await apiPost(`/api/v2/contracts/${contractId}/sign`, { signatureType: 'ELECTRONIC' });
      toast({
        title: t('common.success', { defaultValue: 'Success!' }),
        description: t('contracts.viewer.signed', { defaultValue: 'Contract signed successfully' }),
      });
      fetchContract(); // Refresh
    } catch (error) {
      console.error('Error signing contract:', error);
      const errorMessage = error instanceof ApiError ? error.message : t('contracts.viewer.signError', { defaultValue: 'Could not sign contract' });
      toast({
        title: t('common.error', { defaultValue: 'Error' }),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleActivate = async () => {
    try {
      await apiPost(`/api/v2/contracts/${contractId}/activate`, {});
      toast({
        title: t('common.success', { defaultValue: 'Success!' }),
        description: t('contracts.viewer.activated', { defaultValue: 'Contract activated successfully' }),
      });
      fetchContract(); // Refresh
    } catch (error) {
      console.error('Error activating contract:', error);
      const errorMessage = error instanceof ApiError ? error.message : t('contracts.viewer.activateError', { defaultValue: 'Could not activate contract' });
      toast({
        title: t('common.error', { defaultValue: 'Error' }),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleTerminate = async () => {
    try {
      await apiPost(`/api/v2/contracts/${contractId}/terminate`, {
        reason: terminationReason,
        effectiveDate: terminationDate,
      });
      toast({
        title: t('common.success', { defaultValue: 'Success!' }),
        description: t('contracts.viewer.terminated', { defaultValue: 'Contract terminated successfully' }),
      });
      setTerminateDialogOpen(false);
      fetchContract(); // Refresh
    } catch (error) {
      console.error('Error terminating contract:', error);
      const errorMessage = error instanceof ApiError ? error.message : t('contracts.viewer.terminateError', { defaultValue: 'Could not terminate contract' });
      toast({
        title: t('common.error', { defaultValue: 'Error' }),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v2/contracts/${contractId}/download`, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract?.contract_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: t('common.error', { defaultValue: 'Error' }),
        description: t('contracts.viewer.downloadError', { defaultValue: 'Could not download contract' }),
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) {return '-';}
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {return <Badge variant="default">{status}</Badge>;}

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t('contracts.viewer.notFound', { defaultValue: 'Contract not found' })}</AlertDescription>
      </Alert>
    );
  }

  const canSign = ['PENDING_SIGNATURE', 'PARTIALLY_SIGNED'].includes(contract.status);
  const canActivate = contract.status === 'FULLY_SIGNED';
  const canTerminate = contract.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {contract.contract_number}
              </CardTitle>
              <CardDescription>
                {contract.job_title} - {contract.candidate_name}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(contract.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('common.actions', { defaultValue: 'Actions' })}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('contracts.viewer.downloadPdf', { defaultValue: 'Download PDF' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-2" />
                    {t('contracts.viewer.print', { defaultValue: 'Print' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    {t('contracts.viewer.sendEmail', { defaultValue: 'Send email' })}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    {t('contracts.viewer.copy', { defaultValue: 'Copy' })}
                  </DropdownMenuItem>
                  {canTerminate && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setTerminateDialogOpen(true)}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Beëindigen
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {contract.company_name}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {contract.bureau_name}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(contract.start_date), 'dd MMM yyyy', { locale: nl })}
              {contract.end_date && (
                <> - {format(new Date(contract.end_date), 'dd MMM yyyy', { locale: nl })}</>
              )}
            </div>
          </div>
        </CardContent>
        {(canSign || canActivate) && (
          <CardFooter className="flex gap-2">
            {canSign && (
              <Button onClick={handleSign}>
                <FileSignature className="h-4 w-4 mr-2" />
                Ondertekenen
              </Button>
            )}
            {canActivate && (
              <Button onClick={handleActivate} variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('contracts.viewer.activate', { defaultValue: 'Activate' })}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">{t('common.details', { defaultValue: 'Details' })}</TabsTrigger>
          <TabsTrigger value="document">{t('contracts.viewer.document', { defaultValue: 'Document' })}</TabsTrigger>
          <TabsTrigger value="signatures">{t('contracts.viewer.signatures', { defaultValue: 'Signatures' })}</TabsTrigger>
          <TabsTrigger value="approvals">{t('contracts.viewer.approvals', { defaultValue: 'Approvals' })}</TabsTrigger>
          <TabsTrigger value="history">{t('contracts.viewer.history', { defaultValue: 'History' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{t('contracts.viewer.detailsTitle', { defaultValue: 'Contract Details' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employment Terms */}
              <div>
                <h3 className="font-medium mb-3">{t('contracts.viewer.employmentTerms', { defaultValue: 'Employment Terms' })}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('contracts.viewer.type', { defaultValue: 'Type:' })}</span>
                    <span className="ml-2 font-medium">
                      {contract.contract_type === 'VAST'
                        ? t('contracts.viewer.typePermanent', { defaultValue: 'Permanent' })
                        : contract.contract_type === 'INTERIM'
                        ? t('contracts.viewer.typeInterim', { defaultValue: 'Interim' })
                        : t('contracts.viewer.typeAgency', { defaultValue: 'Temporary' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('contracts.viewer.workingHours', { defaultValue: 'Working hours:' })}</span>
                    <span className="ml-2 font-medium">
                      {contract.working_hours || 40} {t('contracts.viewer.hoursPerWeek', { defaultValue: 'hours/week' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('contracts.viewer.salary', { defaultValue: 'Salary:' })}</span>
                    <span className="ml-2 font-medium">
                      {contract.contract_type === 'VAST'
                        ? formatCurrency(contract.salary_amount)
                        : contract.hourly_rate
                        ? `€${contract.hourly_rate}/${t('contracts.viewer.perHourShort', { defaultValue: 'hr' })}`
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('contracts.viewer.vacationDays', { defaultValue: 'Vacation days:' })}</span>
                    <span className="ml-2 font-medium">
                      {contract.vacation_days || 25} {t('contracts.viewer.daysPerYear', { defaultValue: 'days/year' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('contracts.viewer.probation', { defaultValue: 'Probation:' })}</span>
                    <span className="ml-2 font-medium">
                      {contract.probation_period || 1} {t('contracts.viewer.months', { defaultValue: 'month(s)' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('contracts.viewer.noticePeriod', { defaultValue: 'Notice period:' })}</span>
                    <span className="ml-2 font-medium">
                      {contract.notice_period || 1} {t('contracts.viewer.months', { defaultValue: 'month(s)' })}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bureau Fees */}
              <div>
                <h3 className="font-medium mb-3">{t('contracts.viewer.agencyFee', { defaultValue: 'Agency Fee' })}</h3>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('contracts.viewer.agencyFeeLabel', { defaultValue: 'Agency fee:' })}</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(contract.bureau_fee_amount)}
                      </span>
                    </div>
                    {contract.fee_calculation_details && (
                      <div>
                        <span className="text-muted-foreground">{t('contracts.viewer.calculation', { defaultValue: 'Calculation:' })}</span>
                        <span className="ml-2 font-medium">
                          {contract.fee_calculation_details.percentage}% {t('contracts.viewer.ofSalary', { defaultValue: 'of salary' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle>{t('contracts.viewer.documentTitle', { defaultValue: 'Contract Document' })}</CardTitle>
              <CardDescription>
                {t('contracts.viewer.documentPreview', { defaultValue: 'Preview of the contract document' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                {contract.contract_html ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: contract.contract_html }}
                    className="prose prose-sm max-w-none"
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {t('contracts.viewer.noDocument', { defaultValue: 'No document available' })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle>{t('contracts.viewer.signaturesTitle', { defaultValue: 'Signatures' })}</CardTitle>
              <CardDescription>
                {t('contracts.viewer.signaturesReceived', { defaultValue: '{{received}} of {{required}} signatures received', received: contract.signatures_received, required: contract.signatures_required })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.contract_signatures?.map((signature) => (
                  <div
                    key={signature.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          signature.is_valid
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {signature.is_valid ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{signature.signer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {signature.signer_role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{signature.signature_type}</div>
                      <div className="text-muted-foreground">
                        {i18nFormatters.for(i18n.language).formatDateTime(signature.signed_at, 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pending signatures */}
                {contract.signatures_received < contract.signatures_required && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      {t('contracts.viewer.waitingForSignatures', { defaultValue: 'Waiting for signatures from {{count}} party(ies)', count: contract.signatures_required - contract.signatures_received })}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>{t('contracts.viewer.approvalsTitle', { defaultValue: 'Approvals' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.contract_approvals && contract.contract_approvals.length > 0 ? (
                <div className="space-y-4">
                  {contract.contract_approvals.map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            approval.status === 'APPROVED'
                              ? 'bg-green-100 text-green-600'
                              : approval.status === 'REJECTED'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {approval.status === 'APPROVED' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : approval.status === 'REJECTED' ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{approval.approver_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {approval.approver_role}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            approval.status === 'APPROVED'
                              ? 'success'
                              : approval.status === 'REJECTED'
                              ? 'destructive'
                              : 'warning'
                          }
                        >
                          {approval.status}
                        </Badge>
                        {approval.comments && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {approval.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {t('contracts.viewer.noApprovals', { defaultValue: 'No approvals required' })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t('contracts.viewer.auditLog', { defaultValue: 'Audit Log' })}</CardTitle>
              <CardDescription>
                {t('contracts.viewer.auditLogDesc', { defaultValue: 'Complete history of this contract' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {contract.contract_audit_log?.map((log) => (
                    <div key={log.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <History className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.performed_by_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {i18nFormatters.for(i18n.language).formatDateTime(log.created_at, 'dd MMM yyyy, HH:mm')}
                        </div>
                        {log.changes_json && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                            {JSON.stringify(log.changes_json, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Terminate Dialog */}
      <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contracts.viewer.terminateTitle', { defaultValue: 'Terminate Contract' })}</DialogTitle>
            <DialogDescription>
              {t('contracts.viewer.terminateDesc', { defaultValue: 'Provide a reason for terminating this contract' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('contracts.viewer.reason', { defaultValue: 'Reason' })}</Label>
              <Textarea
                placeholder={t('contracts.viewer.reasonPlaceholder', { defaultValue: 'Provide a reason...' })}
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
              />
            </div>
            <div>
              <Label>{t('contracts.viewer.effectiveDate', { defaultValue: 'Effective date' })}</Label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTerminateDialogOpen(false)}
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleTerminate}
              disabled={!terminationReason}
            >
              {t('contracts.viewer.terminate', { defaultValue: 'Terminate' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
