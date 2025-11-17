/**
 * Shared Shortlists Component
 *
 * Manage candidate sharing between bureaus:
 * - View candidates shared with you
 * - View candidates you've shared
 * - Accept/reject shared candidates
 * - Share new candidates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiDelete, ApiError } from '@/lib/api-client';
import {
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Share2,
  Clock,
  Briefcase,
} from 'lucide-react';

interface SharedShortlist {
  id: string;
  sharingBureauId: string;
  sharedWithBureauId: string;
  candidateId: string;
  relatedJobId?: string;
  permissionLevel: string;
  shareMessage?: string;
  isAccepted: boolean;
  acceptedAt?: string;
  expiresAt?: string;
  createdAt: string;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    skills: string[];
  };
  sharingBureau?: {
    id: string;
    name: string;
    companyName?: string;
  };
  sharedWithBureau?: {
    id: string;
    name: string;
    companyName?: string;
  };
  relatedJob?: {
    id: string;
    title: string;
  };
}

interface SharedShortlistsProps {
  bureauId: string;
}

export function SharedShortlists({ bureauId }: SharedShortlistsProps) {
  const { toast } = useToast();
  const [sharedWithMe, setSharedWithMe] = useState<SharedShortlist[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedShortlist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShortlists();
  }, []);

  const fetchShortlists = async () => {
    setLoading(true);
    try {
      const [withMeData, byMeData] = await Promise.all([
        apiGet('/api/bureau/shortlists/shared-with-me'),
        apiGet('/api/bureau/shortlists/shared-by-me'),
      ]);

      setSharedWithMe(withMeData.data || []);
      setSharedByMe(byMeData.data || []);
    } catch (error) {
      console.error('Failed to fetch shortlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (shortlistId: string) => {
    try {
      await apiPost(`/api/bureau/shortlists/${shortlistId}/accept`);
      toast({
        title: 'Success',
        description: 'Candidate accepted successfully',
      });
      fetchShortlists();
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to accept candidate';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (shortlistId: string) => {
    try {
      await apiDelete(`/api/bureau/shortlists/${shortlistId}/reject`);
      toast({
        title: 'Success',
        description: 'Candidate rejected',
      });
      fetchShortlists();
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to reject candidate';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleRevoke = async (shortlistId: string) => {
    try {
      await apiDelete(`/api/bureau/shortlists/${shortlistId}/revoke`);
      toast({
        title: 'Success',
        description: 'Share revoked successfully',
      });
      fetchShortlists();
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to revoke share';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) {return false;}
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shared Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Shared Candidates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Received ({sharedWithMe.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sharedByMe.length})
            </TabsTrigger>
          </TabsList>

          {/* Received Tab */}
          <TabsContent value="received" className="space-y-4 mt-4">
            {sharedWithMe.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No candidates shared with you yet</p>
              </div>
            ) : (
              sharedWithMe.map((shortlist) => (
                <div
                  key={shortlist.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {shortlist.candidate?.firstName} {shortlist.candidate?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{shortlist.candidate?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Shared by: {shortlist.sharingBureau?.companyName || shortlist.sharingBureau?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={shortlist.isAccepted ? 'default' : 'secondary'}>
                        {shortlist.isAccepted ? 'Accepted' : 'Pending'}
                      </Badge>
                      {isExpired(shortlist.expiresAt) && (
                        <Badge variant="destructive" className="ml-2">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>

                  {shortlist.relatedJob && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Briefcase className="h-4 w-4" />
                      <span>For: {shortlist.relatedJob.title}</span>
                    </div>
                  )}

                  {shortlist.candidate?.skills && shortlist.candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {shortlist.candidate.skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {shortlist.shareMessage && (
                    <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                      <p className="text-gray-700">{shortlist.shareMessage}</p>
                    </div>
                  )}

                  {shortlist.expiresAt && !isExpired(shortlist.expiresAt) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Clock className="h-3 w-3" />
                      <span>Expires: {new Date(shortlist.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {!shortlist.isAccepted && !isExpired(shortlist.expiresAt) && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(shortlist.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(shortlist.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent value="sent" className="space-y-4 mt-4">
            {sharedByMe.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>You haven't shared any candidates yet</p>
              </div>
            ) : (
              sharedByMe.map((shortlist) => (
                <div
                  key={shortlist.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {shortlist.candidate?.firstName} {shortlist.candidate?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{shortlist.candidate?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Shared with: {shortlist.sharedWithBureau?.companyName || shortlist.sharedWithBureau?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={shortlist.isAccepted ? 'default' : 'secondary'}>
                        {shortlist.isAccepted ? 'Accepted' : 'Pending'}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        <Eye className="h-3 w-3 mr-1" />
                        {shortlist.permissionLevel}
                      </Badge>
                    </div>
                  </div>

                  {shortlist.relatedJob && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Briefcase className="h-4 w-4" />
                      <span>For: {shortlist.relatedJob.title}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      Shared: {new Date(shortlist.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(shortlist.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
