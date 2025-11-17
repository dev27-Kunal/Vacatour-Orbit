import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  MessageSquareMore,
  UserCheck,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { useLocation } from "wouter";

interface User {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  userType: string;
}

interface Job {
  id: string;
  title: string;
  location: string;
}

interface GroupChatCreateProps {
  jobId?: string;
  initialParticipants?: string[];
  children?: React.ReactNode;
}

export function GroupChatCreate({ jobId, initialParticipants = [], children }: GroupChatCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'participants' | 'success'>('form');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(initialParticipants);
  const [createdThreadId, setCreatedThreadId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [, setLocation] = useLocation();

  // Fetch available users for the group
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users/search'],
    enabled: isOpen && step === 'participants',
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch jobs for context
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    enabled: isOpen && !jobId,
  });

  // Create group chat mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: {
      groupName: string;
      groupDescription?: string;
      participantIds: string[];
      jobId?: string;
    }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v2/messages/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          isGroup: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create group chat');
      }

      const result = await response.json();
      return result.data; // V2 wraps in data property
    },
    onSuccess: (thread) => {
      setCreatedThreadId(thread.id);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['/api/v2/messages/threads'] });
      toast({
        title: "Group chat created",
        description: `Group "${groupName}" has been created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating group chat",
        description: error.message || "Failed to create group chat",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(u => 
    u.id !== user?.id && // Exclude current user
    (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const selectedUsers = users.filter(u => selectedParticipants.includes(u.id));

  const handleParticipantToggle = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group chat",
        variant: "destructive",
      });
      return;
    }

    if (selectedParticipants.length < 1) {
      toast({
        title: "Participants required",
        description: "Please select at least one participant for the group",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate({
      groupName: groupName.trim(),
      groupDescription: groupDescription.trim() || undefined,
      participantIds: selectedParticipants,
      jobId,
    });
  };

  const resetForm = () => {
    setStep('form');
    setGroupName('');
    setGroupDescription('');
    setSearchTerm('');
    setSelectedParticipants(initialParticipants);
    setCreatedThreadId(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  const goToGroupChat = () => {
    if (createdThreadId) {
      setLocation(`/messages/${createdThreadId}`);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Create Group Chat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareMore className="h-5 w-5" />
            {step === 'form' && 'Create Group Chat'}
            {step === 'participants' && 'Select Participants'}
            {step === 'success' && 'Group Chat Created'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{groupName.length}/100 characters</p>
            </div>

            <div>
              <Label htmlFor="group-description">Description (Optional)</Label>
              <Textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Describe the purpose of this group..."
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{groupDescription.length}/500 characters</p>
            </div>

            {jobId && (
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  This group chat will be associated with the selected job posting.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('participants')}>
                Next: Select Participants
              </Button>
            </div>
          </div>
        )}

        {step === 'participants' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="search-users">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search-users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or company..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Selected participants */}
            {selectedUsers.length > 0 && (
              <div>
                <Label>Selected Participants ({selectedUsers.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 bg-background rounded-md">
                  {selectedUsers.map(user => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                      {user.name}
                      <button
                        onClick={() => handleParticipantToggle(user.id)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available users */}
            <div>
              <Label>Available Users</Label>
              <ScrollArea className="h-64 border rounded-md">
                {isLoadingUsers ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? `No users found matching "${searchTerm}"` : 'No users available'}
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredUsers.map(user => {
                      const isSelected = selectedParticipants.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-2 rounded-md hover:bg-background cursor-pointer ${
                            isSelected ? 'bg-blue-50 border-blue-200 border' : ''
                          }`}
                          onClick={() => handleParticipantToggle(user.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleParticipantToggle(user.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{user.name}</p>
                              {isSelected && <UserCheck className="h-4 w-4 text-green-600" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            {user.companyName && (
                              <p className="text-xs text-gray-400 truncate">{user.companyName}</p>
                            )}
                          </div>
                          <Badge variant="outline">
                            {user.userType}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('form')}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateGroup}
                  disabled={createGroupMutation.isPending || selectedParticipants.length === 0}
                >
                  {createGroupMutation.isPending ? (
                    'Creating...'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group ({selectedParticipants.length + 1})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquareMore className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Group Chat Created!</h3>
              <p className="text-gray-600 mb-4">
                Your group "{groupName}" has been created with {selectedParticipants.length + 1} members.
              </p>
              
              <div className="bg-background rounded-lg p-4 mb-4">
                <div className="text-left space-y-2">
                  <p className="font-medium">Group Details:</p>
                  <p className="text-sm">• Name: {groupName}</p>
                  {groupDescription && <p className="text-sm">• Description: {groupDescription}</p>}
                  <p className="text-sm">• Members: {selectedParticipants.length + 1} (including you)</p>
                  {selectedUsers.length > 0 && (
                    <div className="text-sm">
                      • Participants: {selectedUsers.map(u => u.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Create Another Group
              </Button>
              <Button onClick={goToGroupChat}>
                Go to Group Chat
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}