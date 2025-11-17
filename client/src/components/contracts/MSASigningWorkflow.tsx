/**
 * MSA Signing Workflow Component
 * Shows signing status for both parties and provides signing actions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileSignature,
  Building,
  Users,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiPost } from '@/lib/api-client';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface SigningParty {
  type: 'company' | 'bureau';
  name: string;
  signed: boolean;
  signedAt?: string;
  signedBy?: string;
}

interface MSASigningWorkflowProps {
  msaId: string;
  msaNumber: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PENDING_SIGNATURES' | 'FULLY_SIGNED' | 'ACTIVE' | 'TERMINATED';
  companyParty: SigningParty;
  bureauParty: SigningParty;
  currentUserType: 'BEDRIJF' | 'BUREAU' | 'ADMIN';
  onStatusChange?: () => void;
  disabled?: boolean;
}

export function MSASigningWorkflow({
  msaId,
  msaNumber,
  status,
  companyParty,
  bureauParty,
  currentUserType,
  onStatusChange,
  disabled = false,
}: MSASigningWorkflowProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const { toast } = useToast();

  const getStatusConfig = () => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Concept',
          variant: 'secondary' as const,
          icon: <Clock className="h-4 w-4" />,
          description: 'MSA is nog in concept fase',
        };
      case 'PENDING_REVIEW':
        return {
          label: 'Ter Beoordeling',
          variant: 'secondary' as const,
          icon: <AlertCircle className="h-4 w-4" />,
          description: 'Wacht op beoordeling door beide partijen',
        };
      case 'PENDING_SIGNATURES':
        return {
          label: 'Wacht op Handtekeningen',
          variant: 'default' as const,
          icon: <FileSignature className="h-4 w-4" />,
          description: 'Wacht op ondertekening door één of beide partijen',
        };
      case 'FULLY_SIGNED':
        return {
          label: 'Volledig Getekend',
          variant: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'Alle partijen hebben getekend, kan geactiveerd worden',
        };
      case 'ACTIVE':
        return {
          label: 'Actief',
          variant: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'MSA is actief en van kracht',
        };
      case 'TERMINATED':
        return {
          label: 'Beëindigd',
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-4 w-4" />,
          description: 'MSA is beëindigd',
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: <Clock className="h-4 w-4" />,
          description: '',
        };
    }
  };

  const canCurrentUserSign = () => {
    if (disabled) {return false;}
    if (status !== 'PENDING_SIGNATURES' && status !== 'PENDING_REVIEW') {return false;}

    if (currentUserType === 'BEDRIJF' && !companyParty.signed) {return true;}
    if (currentUserType === 'BUREAU' && !bureauParty.signed) {return true;}

    return false;
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      const response = await apiPost(`/api/vms/msa/${msaId}/sign`, {
        partyType: currentUserType === 'BEDRIJF' ? 'company' : 'bureau',
      });

      if (!response.success) {
        throw new Error(response.error || 'Ondertekening mislukt');
      }

      toast({
        title: 'Ondertekend',
        description: 'MSA succesvol ondertekend',
      });

      setConfirmDialogOpen(false);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message || 'Kon MSA niet ondertekenen',
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  const statusConfig = getStatusConfig();
  const bothSigned = companyParty.signed && bureauParty.signed;
  const canSign = canCurrentUserSign();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Ondertekening Status
            </CardTitle>
            <CardDescription>MSA {msaNumber}</CardDescription>
          </div>
          <Badge variant={statusConfig.variant}>
            <span className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Description */}
        {statusConfig.description && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{statusConfig.description}</AlertDescription>
          </Alert>
        )}

        {/* Signing Parties Status */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Partijen</h4>

          {/* Company Party */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{companyParty.name}</p>
                <p className="text-sm text-muted-foreground">Opdrachtgever</p>
              </div>
            </div>
            <div className="text-right">
              {companyParty.signed ? (
                <div>
                  <Badge variant="default" className="mb-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Getekend
                  </Badge>
                  {companyParty.signedAt && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(companyParty.signedAt), 'dd MMM yyyy HH:mm', { locale: nl })}
                    </p>
                  )}
                  {companyParty.signedBy && (
                    <p className="text-xs text-muted-foreground">door {companyParty.signedBy}</p>
                  )}
                </div>
              ) : (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Niet getekend
                </Badge>
              )}
            </div>
          </div>

          {/* Bureau Party */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{bureauParty.name}</p>
                <p className="text-sm text-muted-foreground">Uitzendbureau</p>
              </div>
            </div>
            <div className="text-right">
              {bureauParty.signed ? (
                <div>
                  <Badge variant="default" className="mb-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Getekend
                  </Badge>
                  {bureauParty.signedAt && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bureauParty.signedAt), 'dd MMM yyyy HH:mm', { locale: nl })}
                    </p>
                  )}
                  {bureauParty.signedBy && (
                    <p className="text-xs text-muted-foreground">door {bureauParty.signedBy}</p>
                  )}
                </div>
              ) : (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Niet getekend
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ondertekening Voortgang</span>
            <span className="font-medium">
              {[companyParty.signed, bureauParty.signed].filter(Boolean).length} van 2
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${([companyParty.signed, bureauParty.signed].filter(Boolean).length / 2) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Success Message */}
        {bothSigned && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Beide partijen hebben de MSA ondertekend. Het contract kan nu geactiveerd worden.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        {canSign && (
          <Button onClick={() => setConfirmDialogOpen(true)} className="w-full" size="lg">
            <FileSignature className="h-5 w-5 mr-2" />
            Onderteken MSA
          </Button>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bevestig Ondertekening</DialogTitle>
              <DialogDescription>
                U staat op het punt om MSA {msaNumber} te ondertekenen. Dit is een juridisch
                bindende handeling.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Door te ondertekenen bevestigt u dat u:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>De volledige MSA heeft gelezen</li>
                    <li>Akkoord gaat met alle voorwaarden</li>
                    <li>Bevoegd bent om namens uw organisatie te tekenen</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Datum: {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: nl })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUserType === 'BEDRIJF' ? (
                      <Building className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                    <span>
                      Namens:{' '}
                      {currentUserType === 'BEDRIJF' ? companyParty.name : bureauParty.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
                disabled={signing}
              >
                Annuleren
              </Button>
              <Button onClick={handleSign} disabled={signing}>
                {signing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Ondertekenen...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Definitief Ondertekenen
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
