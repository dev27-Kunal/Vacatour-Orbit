/**
 * AcceptJobDialog Component
 *
 * Confirmation dialog when accepting a job distribution.
 * Shows job details summary and optional notes field.
 *
 * Features:
 * - Job details summary
 * - Optional comments/notes
 * - Confirm/Cancel actions
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
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Briefcase,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { Distribution } from '@/lib/api/bureau-distributions';

// ============================================================================
// Types
// ============================================================================

interface AcceptJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
  distribution: Distribution;
  loading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function AcceptJobDialog({
  isOpen,
  onClose,
  onConfirm,
  distribution,
  loading = false,
}: AcceptJobDialogProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(notes || undefined);
      setNotes(''); // Reset notes on success
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Accept Job Opportunity
          </DialogTitle>
          <DialogDescription>
            Confirm that you want to work on this job. You'll be able to submit candidates
            after accepting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Summary */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <h4 className="font-semibold text-lg">{distribution.jobTitle}</h4>
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {distribution.companyName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {distribution.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {distribution.employmentType}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-300"
              >
                {distribution.distributionTier}
              </Badge>
              {distribution.isExclusive && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-300"
                >
                  Exclusive
                </Badge>
              )}
            </div>

            {distribution.maxCandidates && (
              <div className="text-sm">
                <span className="text-gray-600">Candidate Limit:</span>{' '}
                <span className="font-medium">{distribution.maxCandidates} candidates</span>
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any comments or notes about this job..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting || loading}
            />
            <p className="text-xs text-gray-500">
              These notes are for your internal reference and won't be shared with the company.
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
            onClick={handleConfirm}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Accept
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
