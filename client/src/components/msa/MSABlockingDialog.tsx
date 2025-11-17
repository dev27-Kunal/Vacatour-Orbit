/**
 * MSABlockingDialog Component
 *
 * Dialog that intercepts hire attempts when no active MSA exists.
 * Displays clear error message and provides inline MSA creation form.
 *
 * Features:
 * - Intercepts BusinessRuleError with code 'NO_ACTIVE_MSA'
 * - Clear messaging about MSA requirement
 * - Embedded InlineMSAForm for immediate resolution
 * - Callback on successful MSA creation to retry hire
 * - Accessible dialog with keyboard navigation
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { InlineMSAForm } from './InlineMSAForm';

interface MSABlockingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  bureauId: string;
  bureauName: string;
  onMSACreated: () => void;
}

export function MSABlockingDialog({
  isOpen,
  onClose,
  companyId,
  bureauId,
  bureauName,
  onMSACreated,
}: MSABlockingDialogProps) {
  const { t } = useTranslation();

  const handleSuccess = () => {
    // Call parent callback to retry hire action
    onMSACreated();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="msa-blocking-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            {t('msa.blocking.title') || 'No Active MSA Found'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('msa.blocking.message') ||
              'An active Master Service Agreement is required to hire candidates submitted by bureaus. Please create one to continue.'}
          </DialogDescription>
        </DialogHeader>

        {/* Warning alert */}
        <Alert className="border-amber-500 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 !text-amber-500" />
          <AlertDescription>
            {t('msa.blocking.requirement') ||
              'You cannot hire this candidate from'} <strong>{bureauName}</strong>{' '}
            {t('msa.blocking.withoutMSA') || 'without an active MSA in place.'}
          </AlertDescription>
        </Alert>

        {/* Inline MSA creation form */}
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-4">
            {t('msa.blocking.createMSANow') || 'Create MSA Now'}
          </h3>
          <InlineMSAForm
            companyId={companyId}
            bureauId={bureauId}
            bureauName={bureauName}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
