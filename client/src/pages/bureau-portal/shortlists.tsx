import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { List, Plus, UserPlus, Briefcase, MapPin, Euro, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface Candidate {
  id: string;
  name: string;
  role: string;
  skills: string[];
  rate: number;
  location: string;
  available: boolean;
}

interface Shortlist {
  id: string;
  name: string;
  companyName: string;
  jobTitle: string;
  candidateCount: number;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  createdAt: string;
  candidates: Candidate[];
}

export default function BureauShortlistsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShortlist, setSelectedShortlist] = useState<Shortlist | null>(null);
  const [newShortlistName, setNewShortlistName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch shortlists
  const { data: shortlists = [], isLoading, error, refetch } = useQuery<Shortlist[]>({
    queryKey: ['bureau-shortlists'],
    queryFn: async () => {
      const response = await fetch('/api/bureau/shortlists', {
        credentials: 'include',
      });
      if (!response.ok) {throw new Error('Failed to fetch shortlists');}
      return response.json();
    },
  });

  // Create shortlist mutation
  const createShortlistMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/bureau/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {throw new Error('Failed to create shortlist');}
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('bureauPortal.shortlists.toast.created.title'),
        description: t('bureauPortal.shortlists.toast.created.desc'),
      });
      setNewShortlistName('');
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['bureau-shortlists'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('bureauPortal.shortlists.toast.createFailed.title'),
        description: error.message || t('bureauPortal.shortlists.toast.createFailed.desc'),
        variant: 'destructive',
      });
    },
  });

  // Remove candidate mutation
  const removeCandidateMutation = useMutation({
    mutationFn: async ({ shortlistId, candidateId }: { shortlistId: string; candidateId: string }) => {
      const response = await fetch(`/api/bureau/shortlists/${shortlistId}/candidates/${candidateId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {throw new Error('Failed to remove candidate');}
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('bureauPortal.shortlists.toast.removed.title'),
        description: t('bureauPortal.shortlists.toast.removed.desc'),
      });
      queryClient.invalidateQueries({ queryKey: ['bureau-shortlists'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('bureauPortal.shortlists.toast.removeFailed.title'),
        description: error.message || t('bureauPortal.shortlists.toast.removeFailed.desc'),
        variant: 'destructive',
      });
    },
  });

  // Submit shortlist mutation
  const submitShortlistMutation = useMutation({
    mutationFn: async (shortlistId: string) => {
      const response = await fetch(`/api/bureau/shortlists/${shortlistId}/submit`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {throw new Error('Failed to submit shortlist');}
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Shortlist submitted',
        description: 'Your shortlist has been submitted to the company for review.',
      });
      queryClient.invalidateQueries({ queryKey: ['bureau-shortlists'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('bureauPortal.shortlists.toast.submitFailed.title'),
        description: error.message || t('bureauPortal.shortlists.toast.submitFailed.desc'),
        variant: 'destructive',
      });
    },
  });

  const handleCreateShortlist = () => {
    if (!newShortlistName.trim()) {return;}
    createShortlistMutation.mutate(newShortlistName);
  };

  const handleRemoveCandidate = (candidateId: string) => {
    if (!selectedShortlist) {return;}
    removeCandidateMutation.mutate({
      shortlistId: selectedShortlist.id,
      candidateId,
    });
  };

  const handleSubmitShortlist = () => {
    if (!selectedShortlist) {return;}
    submitShortlistMutation.mutate(selectedShortlist.id);
  };

  const getStatusBadgeVariant = (status: Shortlist['status']) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'under_review':
        return 'outline';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: Shortlist['status']) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const draftShortlists = shortlists.filter((s) => s.status === 'draft');
  const submittedShortlists = shortlists.filter((s) => s.status !== 'draft');

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('bureauPortal.shortlists.errors.loadTitle')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message || t('bureauPortal.shortlists.errors.loadDesc')}</span>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('navigation.myShortlists')}</h1>
          <p className="text-muted-foreground">{t('bureauPortal.shortlists.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('bureauPortal.shortlists.actions.new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('bureauPortal.shortlists.create.title')}</DialogTitle>
              <DialogDescription>
                {t('bureauPortal.shortlists.create.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder={t('bureauPortal.shortlists.create.namePlaceholder')}
                value={newShortlistName}
                onChange={(e) => setNewShortlistName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewShortlistName('');
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreateShortlist}
                disabled={!newShortlistName.trim() || createShortlistMutation.isPending}
              >
                {t('bureauPortal.shortlists.actions.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shortlists List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Shortlists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="draft" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="draft">
                    Draft ({draftShortlists.length})
                  </TabsTrigger>
                  <TabsTrigger value="submitted">
                    Submitted ({submittedShortlists.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="draft" className="space-y-2 mt-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                    </div>
                  ) : draftShortlists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <List className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No draft shortlists</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first shortlist to get started
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Shortlist
                      </Button>
                    </div>
                  ) : (
                    draftShortlists.map((shortlist) => (
                      <div
                        key={shortlist.id}
                        onClick={() => setSelectedShortlist(shortlist)}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                          selectedShortlist?.id === shortlist.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm">{shortlist.name}</p>
                          <Badge variant={getStatusBadgeVariant(shortlist.status)}>
                            {getStatusLabel(shortlist.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {shortlist.companyName || 'No company assigned'}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {shortlist.jobTitle || 'No job assigned'}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {shortlist.candidateCount} candidates
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(shortlist.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="submitted" className="space-y-2 mt-4">
                  {submittedShortlists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No submitted shortlists</h3>
                      <p className="text-sm text-muted-foreground">
                        Shortlists you submit to companies will appear here
                      </p>
                    </div>
                  ) : (
                    submittedShortlists.map((shortlist) => (
                      <div
                        key={shortlist.id}
                        onClick={() => setSelectedShortlist(shortlist)}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                          selectedShortlist?.id === shortlist.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm">{shortlist.name}</p>
                          <Badge variant={getStatusBadgeVariant(shortlist.status)}>
                            {getStatusLabel(shortlist.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {shortlist.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {shortlist.jobTitle}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {shortlist.candidateCount} candidates
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(shortlist.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Shortlist Detail */}
        <div className="lg:col-span-2">
          {selectedShortlist ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedShortlist.name}</CardTitle>
                    <CardDescription>
                      {selectedShortlist.companyName && (
                        <>
                          {selectedShortlist.companyName} • {selectedShortlist.jobTitle}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadgeVariant(selectedShortlist.status)}>
                      {getStatusLabel(selectedShortlist.status)}
                    </Badge>
                    {selectedShortlist.status === 'draft' && (
                      <Button
                        onClick={handleSubmitShortlist}
                        disabled={
                          selectedShortlist.candidateCount === 0 ||
                          submitShortlistMutation.isPending
                        }
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Submit to Company
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedShortlist.candidates.length === 0 ? (
                  <div className="text-center py-16">
                    <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No candidates yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add candidates to this shortlist to get started
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Candidates
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedShortlist.candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {candidate.role}
                              </p>
                            </div>
                            {selectedShortlist.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCandidate(candidate.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {candidate.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              €{candidate.rate}/hr
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </span>
                            {candidate.available && (
                              <Badge variant="default" className="h-5">
                                Available
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <List className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No shortlist selected</p>
                <p className="text-sm text-muted-foreground">
                  Select a shortlist from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
