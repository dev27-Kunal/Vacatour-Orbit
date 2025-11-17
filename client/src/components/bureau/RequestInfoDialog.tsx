/**
 * RequestInfoDialog Component
 *
 * Dialog for requesting more information about a job from the company.
 * Shows notification that company will be contacted.
 *
 * Features:
 * - Free text area for questions
 * - Character counter
 * - Validation
 * - Loading state during submission
 * - Notification that company will be contacted
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
import { MessageSquare, Loader2, AlertCircle, Info } from 'lucide-react';
import type { RequestInfoRequest } from '@/lib/api/bureau-distributions';

// ============================================================================
// Types
// ============================================================================

interface RequestInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (request: RequestInfoRequest) => Promise<void>;
  jobTitle: string;
  companyName: string;
  loading?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 500;

// ============================================================================
// Component
// ============================================================================

export function RequestInfoDialog({
  isOpen,
  onClose,
  onSend,
  jobTitle,
  companyName,
  loading = false,
}: RequestInfoDialogProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const characterCount = message.length;
  const isValid =
    characterCount >= MIN_MESSAGE_LENGTH &&
    characterCount <= MAX_MESSAGE_LENGTH;

  const handleSend = async () => {
    // Validation
    if (!message.trim()) {
      setError('Please enter your question or request');
      return;
    }

    if (characterCount < MIN_MESSAGE_LENGTH) {
      setError(`Message must be at least ${MIN_MESSAGE_LENGTH} characters`);
      return;
    }

    if (characterCount > MAX_MESSAGE_LENGTH) {
      setError(`Message must not exceed ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSend({ message: message.trim() });

      // Reset form on success
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      setMessage('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Request More Information
          </DialogTitle>
          <DialogDescription>
            Send a message to {companyName} to request additional details about this job.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Info */}
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Job</p>
            <p className="font-semibold">{jobTitle}</p>
            <p className="text-sm text-gray-600 mt-1">Company: {companyName}</p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Your Question or Request <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="What additional information do you need about this job? (e.g., specific skills required, team size, project details, work environment...)"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError(null);
              }}
              rows={5}
              disabled={isSubmitting || loading}
              className={characterCount > MAX_MESSAGE_LENGTH ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center text-xs">
              <span
                className={
                  characterCount < MIN_MESSAGE_LENGTH
                    ? 'text-gray-500'
                    : characterCount > MAX_MESSAGE_LENGTH
                    ? 'text-red-600'
                    : 'text-green-600'
                }
              >
                {characterCount} / {MAX_MESSAGE_LENGTH} characters
                {characterCount < MIN_MESSAGE_LENGTH &&
                  ` (minimum ${MIN_MESSAGE_LENGTH})`}
              </span>
            </div>
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

          {/* Info Messages */}
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                <Info className="h-4 w-4 inline mr-1" />
                The company will be notified and will respond directly to you via the
                platform messaging system.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800">
                <Info className="h-4 w-4 inline mr-1" />
                You can still accept or decline this job while waiting for a response.
              </p>
            </div>
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
            onClick={handleSend}
            disabled={isSubmitting || loading || !isValid}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
