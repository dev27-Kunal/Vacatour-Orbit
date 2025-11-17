import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Mail, Share2, Users, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { useTranslation } from "react-i18next";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
}

interface GuestChatInviteProps {
  jobId?: string;
  children?: React.ReactNode;
}

interface CreateGuestSessionData {
  guestName?: string;
  guestEmail?: string;
  jobId?: string;
  maxMessages: number;
  expiresAt: Date;
}

export function GuestChatInvite({ jobId, children }: GuestChatInviteProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [maxMessages, setMaxMessages] = useState(50);
  const [expiryDays, setExpiryDays] = useState(7);
  const [guestUrl, setGuestUrl] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useApp();

  // Fetch user's jobs
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    enabled: isOpen && !jobId, // Only fetch if modal is open and no specific jobId provided
  });

  // Create guest chat session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: CreateGuestSessionData) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/guest-chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create guest chat session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSessionData(data);
      setGuestUrl(`${window.location.origin}${data.guestUrl}`);
      setStep('success');
      toast({
        title: t('guest.chat.linkSuccess'),
        description: t('guest.chat.linkSuccessDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('guest.chat.linkError'),
        description: error.message || t('guest.chat.linkErrorDescription'),
        variant: "destructive",
      });
    },
  });

  const handleCreateSession = () => {
    if (!selectedJobId) {
      toast({
        title: t('guest.chat.jobRequired'),
        description: t('guest.chat.selectJobDescription'),
        variant: "destructive",
      });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    createSessionMutation.mutate({
      guestName: guestName.trim() || undefined,
      guestEmail: guestEmail.trim() || undefined,
      jobId: selectedJobId,
      maxMessages,
      expiresAt,
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('guest.chat.clipboardSuccess'),
        description: t('guest.chat.clipboardSuccessDescription'),
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const sendEmailInvite = () => {
    if (!guestEmail) {
      toast({
        title: "Email required",
        description: "Please enter the guest's email address",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent("Chat invitation - Vacature ORBIT");
    const body = encodeURIComponent(
      `Hello ${guestName || 'there'},\n\n` +
      `You have been invited to chat about a job opportunity!\n\n` +
      `Click the link below to start chatting:\n${guestUrl}\n\n` +
      `This link will expire on ${sessionData?.session?.expiresAt ? new Date(sessionData.session.expiresAt).toLocaleDateString() : 'the expiry date'}.\n\n` +
      `Best regards,\n${user?.name || 'The team'}`
    );

    window.open(`mailto:${guestEmail}?subject=${subject}&body=${body}`);
  };

  const resetForm = () => {
    setStep('form');
    setGuestName('');
    setGuestEmail('');
    setSelectedJobId(jobId || '');
    setMaxMessages(50);
    setExpiryDays(7);
    setGuestUrl('');
    setSessionData(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300); // Reset after dialog closes
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invite Guest to Chat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {step === 'form' ? 'Create Guest Chat Invitation' : 'Guest Chat Link Created'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="job-select">Select Job *</Label>
              <Select 
                value={selectedJobId} 
                onValueChange={setSelectedJobId}
                disabled={!!jobId || isLoadingJobs}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingJobs && <p className="text-sm text-gray-500 mt-1">Loading jobs...</p>}
            </div>

            <div>
              <Label htmlFor="guest-name">Guest Name (Optional)</Label>
              <Input
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest's name"
              />
            </div>

            <div>
              <Label htmlFor="guest-email">Guest Email (Optional)</Label>
              <Input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Enter guest's email for direct invite"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-messages">Max Messages</Label>
                <Select value={maxMessages.toString()} onValueChange={(value) => setMaxMessages(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 messages</SelectItem>
                    <SelectItem value="50">50 messages</SelectItem>
                    <SelectItem value="100">100 messages</SelectItem>
                    <SelectItem value="200">200 messages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry-days">Expires In</Label>
                <Select value={expiryDays.toString()} onValueChange={(value) => setExpiryDays(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Guest will be able to send up to {maxMessages} messages within {expiryDays} day{expiryDays !== 1 ? 's' : ''}.
                After that, they can convert to a full user account to continue.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSession}
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Create Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Guest Chat Link Ready!</h3>
              <p className="text-gray-600 text-sm">
                Share this link with your guest to start chatting
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Guest Chat Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={guestUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(guestUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {guestEmail && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={sendEmailInvite}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email Invitation
                </Button>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Expires: {sessionData?.session?.expiresAt ? new Date(sessionData.session.expiresAt).toLocaleDateString() : 'N/A'}</p>
                <p>• Max messages: {maxMessages}</p>
                <p>• Guest can convert to full account later</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Create Another
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}