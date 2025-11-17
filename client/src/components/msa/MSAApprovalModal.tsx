/**
 * MSA Approval Modal Component
 *
 * Displays MSA details and allows users to approve or reject Master Service Agreements.
 * Includes approval status tracking, document details, and action buttons.
 *
 * Features:
 * - Display MSA details (number, name, parties, terms)
 * - Show approval status badges (company/bureau)
 * - Approve button with confirmation
 * - Reject button with reason textarea
 * - Loading states and error handling
 * - Responsive design for mobile
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiPost, ApiError } from '@/lib/api-client';
import { MSADocument, MSAApprovalResponse } from '@/types/msa';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MSAApprovalModalProps {
  msa: MSADocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userType: 'BEDRIJF' | 'BUREAU';
}

export function MSAApprovalModal({
  msa,
  isOpen,
  onClose,
  onSuccess,
  userType,
}: MSAApprovalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  // Approve MSA mutation
  const approveMutation = useMutation<MSAApprovalResponse, ApiError, string>({
    mutationFn: async (msaId: string) => {
      const response = await apiPost<MSAApprovalResponse>(`/api/msa/approve/${msaId}`, {});
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'MSA Approved',
        description: `Successfully approved ${data.data.name}`,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['msa', 'awaiting-approval'] });
      queryClient.invalidateQueries({ queryKey: ['msa', msa?.id] });
      setShowApproveConfirm(false);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve MSA',
        variant: 'destructive',
      });
    },
  });

  // Reject MSA mutation
  const rejectMutation = useMutation<
    MSAApprovalResponse,
    ApiError,
    { msaId: string; reason: string }
  >({
    mutationFn: async ({ msaId, reason }) => {
      const response = await apiPost<MSAApprovalResponse>(`/api/msa/reject/${msaId}`, {
        reason,
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'MSA Rejected',
        description: `Successfully rejected ${data.data.name}`,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['msa', 'awaiting-approval'] });
      queryClient.invalidateQueries({ queryKey: ['msa', msa?.id] });
      setShowRejectForm(false);
      setRejectionReason('');
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject MSA',
        variant: 'destructive',
      });
    },
  });

  const handleApprove = () => {
    if (!msa) {return;}
    setShowApproveConfirm(true);
  };

  const handleConfirmApprove = () => {
    if (!msa) {return;}
    approveMutation.mutate(msa.id);
  };

  const handleReject = () => {
    setShowRejectForm(true);
  };

  const handleConfirmReject = () => {
    if (!msa || !rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting this MSA',
        variant: 'destructive',
      });
      return;
    }
    rejectMutation.mutate({ msaId: msa.id, reason: rejectionReason });
  };

  const handleClose = () => {
    setShowRejectForm(false);
    setShowApproveConfirm(false);
    setRejectionReason('');
    onClose();
  };

  if (!msa) {return null;}

  const isCompanyApproved = !!msa.companyApprovedAt;
  const isBureauApproved = !!msa.bureauApprovedAt;
  const isLoading = approveMutation.isPending || rejectMutation.isPending;

  // Determine if current user can approve
  const canApprove =
    (userType === 'BEDRIJF' && !isCompanyApproved) ||
    (userType === 'BUREAU' && !isBureauApproved);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Master Service Agreement
          </DialogTitle>
          <DialogDescription>
            Review and approve the MSA details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* MSA Header Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">MSA Number</p>
                  <p className="font-semibold">{msa.msaNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agreement Name</p>
                  <p className="font-semibold">{msa.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parties Involved */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Parties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Company</p>
                  <p className="font-medium">{msa.companyName || 'Unknown'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Bureau</p>
                  <p className="font-medium">{msa.bureauName || 'Unknown'}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Financial Terms */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Payment Terms</p>
                  <p className="font-medium">{msa.paymentTermsDays} days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Notice Period</p>
                  <p className="font-medium">{msa.noticePeriodDays} days</p>
                </CardContent>
              </Card>
              {msa.liabilityCap && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Liability Cap</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat('nl-NL', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(msa.liabilityCap)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agreement Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Effective Date</p>
                  <p className="font-medium">
                    {format(new Date(msa.effectiveDate), 'dd MMM yyyy')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Expiration Date</p>
                  <p className="font-medium">
                    {format(new Date(msa.expirationDate), 'dd MMM yyyy')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Auto-Renewal</p>
                  <p className="font-medium">
                    {msa.autoRenew ? `Yes (${msa.renewalPeriodMonths} months)` : 'No'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Approval Status */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Approval Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Company Approval</p>
                    <Badge
                      variant={isCompanyApproved ? 'default' : 'outline'}
                      className={cn(
                        isCompanyApproved
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'border-amber-500 text-amber-600'
                      )}
                    >
                      {isCompanyApproved ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>
                  {msa.companyApprovedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(msa.companyApprovedAt), 'dd MMM yyyy HH:mm')}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Bureau Approval</p>
                    <Badge
                      variant={isBureauApproved ? 'default' : 'outline'}
                      className={cn(
                        isBureauApproved
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'border-amber-500 text-amber-600'
                      )}
                    >
                      {isBureauApproved ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>
                  {msa.bureauApprovedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(msa.bureauApprovedAt), 'dd MMM yyyy HH:mm')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-semibold">Reject MSA</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">
                      Reason for Rejection <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Please provide a detailed reason for rejecting this MSA..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This reason will be shared with the other party.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approve Confirmation */}
          {showApproveConfirm && (
            <Card className="border-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">
                    Are you sure you want to approve this MSA?
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  By approving, you confirm that you have reviewed and agree to all terms
                  and conditions outlined in this Master Service Agreement.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {/* Default State */}
          {!showRejectForm && !showApproveConfirm && (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Close
              </Button>
              {canApprove && (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={handleApprove} disabled={isLoading}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </>
          )}

          {/* Reject Confirmation State */}
          {showRejectForm && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={isLoading || !rejectionReason.trim()}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </>
          )}

          {/* Approve Confirmation State */}
          {showApproveConfirm && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowApproveConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmApprove} disabled={isLoading}>
                {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
