/**
 * VendorOnboardingDialog Component
 *
 * Dialog for onboarding new recruitment bureaus (vendors) to the VMS system.
 * Allows companies to invite bureaus and initiate MSA creation.
 *
 * Features:
 * - Bureau search by email or name
 * - Invitation sending
 * - Automatic MSA creation workflow initiation
 * - Success feedback and list refresh
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail, AlertTriangle } from 'lucide-react';

interface VendorOnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VendorOnboardingDialog({
  isOpen,
  onClose,
  onSuccess,
}: VendorOnboardingDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [bureauEmail, setBureauEmail] = useState('');
  const [bureauName, setBureauName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bureauEmail || !bureauName) {
      setError('Vul alle velden in');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bureauEmail)) {
      setError('Ongeldig e-mailadres');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/vms/vendors/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bureauEmail,
          bureauName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast({
        title: 'Uitnodiging verzonden',
        description: `Een uitnodiging is verzonden naar ${bureauEmail}`,
        variant: 'default',
      });

      // Reset form
      setBureauEmail('');
      setBureauName('');

      // Call success callback to refresh list
      onSuccess();

      // Close dialog
      onClose();
    } catch (err: any) {
      console.error('Error sending vendor invitation:', err);
      setError(err.message || 'Kon uitnodiging niet verzenden');
      toast({
        title: 'Fout',
        description: err.message || 'Kon uitnodiging niet verzenden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setBureauEmail('');
    setBureauName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="vendor-onboarding-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Nieuwe Leverancier Onboarden
          </DialogTitle>
          <DialogDescription>
            Nodig een recruitment bureau uit om samen te werken.
            Ze ontvangen een uitnodiging en u kunt vervolgens een MSA aanmaken.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Bureau Name */}
            <div className="space-y-2">
              <Label htmlFor="bureau-name">
                Bedrijfsnaam <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bureau-name"
                type="text"
                placeholder="Bijv. Recruitment Partners B.V."
                value={bureauName}
                onChange={(e) => setBureauName(e.target.value)}
                disabled={isLoading}
                data-testid="input-bureau-name"
                required
              />
            </div>

            {/* Bureau Email */}
            <div className="space-y-2">
              <Label htmlFor="bureau-email">
                E-mailadres <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bureau-email"
                  type="email"
                  placeholder="contactpersoon@bureau.nl"
                  value={bureauEmail}
                  onChange={(e) => setBureauEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                  data-testid="input-bureau-email"
                  required
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Info Alert */}
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Let op:</strong> Het bureau ontvangt een e-mail met een uitnodiging.
                Nadat ze hebben geaccepteerd, kunt u een Master Service Agreement (MSA) aanmaken.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verzenden...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Uitnodiging Verzenden
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
