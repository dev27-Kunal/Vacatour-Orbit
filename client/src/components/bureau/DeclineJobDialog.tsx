/**
 * DeclineJobDialog Component
 *
 * Dialog for declining a job distribution.
 * Requires a reason selection and optional notes.
 *
 * Features:
 * - Reason selection dropdown (required)
 * - Optional notes field for "Other" reason
 * - Validation before submission
 * - Loading state during submission
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { XCircle, Loader2, AlertCircle } from 'lucide-react';
import type { DeclineJobRequest } from '@/lib/api/bureau-distributions';

// ============================================================================
// Types
// ============================================================================

interface DeclineJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (request: DeclineJobRequest) => Promise<void>;
  jobTitle: string;
  loading?: boolean;
}

type DeclineReason = DeclineJobRequest['reason'];

// ============================================================================
// Constants
// ============================================================================

const DECLINE_REASONS: Array<{ value: DeclineReason; label: string }> = [
  { value: 'NOT_MY_SPECIALIZATION', label: 'Not my specialization' },
  { value: 'AT_CAPACITY', label: 'At capacity' },
  { value: 'LOCATION_NOT_COVERED', label: 'Location not covered' },
  { value: 'OTHER', label: 'Other' },
];

// ============================================================================
// Component
// ============================================================================

export function DeclineJobDialog({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  loading = false,
}: DeclineJobDialogProps) {
  const [reason, setReason] = useState<DeclineReason | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    // Validation
    if (!reason) {
      setError('Please select a reason for declining');
      return;
    }

    if (reason === 'OTHER' && !notes.trim()) {
      setError('Please provide details when selecting "Other"');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm({
        reason,
        notes: notes.trim() || undefined,
      });

      // Reset form on success
      setReason('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      setReason('');
      setNotes('');
      setError(null);
      onClose();
    }
  };

  const isOtherReason = reason === 'OTHER';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Decline Job Opportunity
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for declining this job. This helps improve our
            job matching for future opportunities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Title */}
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Job</p>
            <p className="font-semibold">{jobTitle}</p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Declining <span className="text-red-600">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => {
                setReason(value as DeclineReason);
                setError(null);
              }}
              disabled={isSubmitting || loading}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {DECLINE_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {isOtherReason ? (
                <>
                  Additional Details <span className="text-red-600">*</span>
                </>
              ) : (
                'Additional Notes (Optional)'
              )}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                isOtherReason
                  ? 'Please explain your reason for declining...'
                  : 'Add any additional context...'
              }
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError(null);
              }}
              rows={3}
              disabled={isSubmitting || loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                {error}
              </p>
            </div>
          )}

          {/* Info Message */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              Declining this job won't affect your ranking. We'll use this feedback to
              send you more relevant opportunities in the future.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || loading || !reason}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Declining...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Confirm Decline
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
