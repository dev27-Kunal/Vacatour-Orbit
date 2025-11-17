import { useState, useEffect } from 'react';
import { 
  Users, 
  MoreHorizontal, 
  Shield, 
  UserPlus, 
  Trash2, 
  Crown,
  Eye,
  Settings,
  Briefcase,
  Loader2
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPatch, apiDelete, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TenantMember, TenantRole } from '@/types/tenant';

interface TenantMembersProps {
  onInviteMember?: () => void;
}

export function TenantMembers({ onInviteMember }: TenantMembersProps) {
  const { currentTenant, currentMembership } = useTenant();
  const { user } = useApp();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!currentTenant) {return;}

    try {
      setIsLoading(true);
      const data = await apiGet('/api/tenants/members');

      if (data.success) {
        setMembers(data.data || []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to load team members';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentTenant]);

  const updateMemberRole = async (memberId: string, newRole: TenantRole) => {
    try {
      setUpdatingMember(memberId);

      // Use V2 API endpoint with PATCH method
      const data = await apiPatch(`/api/tenants/current/members/${memberId}/role`, { role: newRole });

      if (data.success) {
        // Update local state
        setMembers(prev => prev.map(member =>
          member.id === memberId
            ? { ...member, role: newRole, updated_at: new Date().toISOString() }
            : member
        ));

        toast({
          title: 'Success',
          description: `Member role updated to ${newRole}`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to update member role:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to update member role';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setUpdatingMember(null);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      setRemovingMember(memberId);

      const data = await apiDelete(`/api/tenants/members/${memberId}`);

      if (data.success) {
        // Remove from local state
        setMembers(prev => prev.filter(member => member.id !== memberId));

        toast({
          title: 'Success',
          description: 'Member removed from organization',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to remove member';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const getRoleIcon = (role: TenantRole) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'MANAGER':
        return <Settings className="h-4 w-4" />;
      case 'MEMBER':
        return <Briefcase className="h-4 w-4" />;
      case 'VIEWER':
        return <Eye className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: TenantRole) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'ADMIN':
        return 'secondary';
      case 'MANAGER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canManageMembers = currentMembership?.role === 'OWNER' || currentMembership?.role === 'ADMIN';
  const canRemoveMember = (member: TenantMember) => {
    if (!canManageMembers) {return false;}
    if (member.user_id === user?.id) {return false;} // Can't remove yourself
    if (member.role === 'OWNER') {return false;} // Can't remove owner
    if (currentMembership?.role === 'ADMIN' && member.role === 'ADMIN') {return false;} // Admin can't remove other admins
    return true;
  };

  const canChangeRole = (member: TenantMember) => {
    if (!canManageMembers) {return false;}
    if (member.user_id === user?.id) {return false;} // Can't change your own role
    if (member.role === 'OWNER') {return false;} // Can't change owner role
    if (currentMembership?.role === 'ADMIN' && member.role === 'ADMIN') {return false;} // Admin can't change other admin roles
    return true;
  };

  const getAvailableRoles = (currentRole: TenantRole): TenantRole[] => {
    if (currentMembership?.role === 'OWNER') {
      return ['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'];
    } else if (currentMembership?.role === 'ADMIN') {
      return ['MANAGER', 'MEMBER', 'VIEWER'];
    }
    return [];
  };

  if (!currentTenant) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No organization selected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
          <p className="text-muted-foreground">
            Manage your organization's team members and their roles
          </p>
        </div>
        
        {canManageMembers && (
          <Button onClick={onInviteMember}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Members ({members.length})
          </CardTitle>
          <CardDescription>
            People with access to this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No members found</h3>
                <p className="text-sm text-muted-foreground">
                  {canManageMembers 
                    ? "Invite team members to get started"
                    : "No team members have been added yet"
                  }
                </p>
              </div>
              {canManageMembers && (
                <Button onClick={onInviteMember} variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite your first member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {getUserInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium truncate">
                          {member.name}
                          {member.user_id === user?.id && (
                            <span className="text-muted-foreground text-sm ml-2">(You)</span>
                          )}
                        </h4>
                        {member.status === 'INACTIVE' && (
                          <Badge variant="outline" className="text-xs">
                            INACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <Badge 
                        variant={getRoleBadgeVariant(member.role)}
                        className="flex items-center"
                      >
                        {member.role}
                      </Badge>
                    </div>

                    {(canChangeRole(member) || canRemoveMember(member)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={updatingMember === member.id || removingMember === member.id}
                          >
                            {updatingMember === member.id || removingMember === member.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {canChangeRole(member) && (
                            <>
                              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                                Change Role
                              </DropdownMenuLabel>
                              {getAvailableRoles(member.role).map((role) => (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => updateMemberRole(member.id, role)}
                                  className="flex items-center space-x-2"
                                  disabled={updatingMember === member.id}
                                >
                                  {getRoleIcon(role)}
                                  <span>{role}</span>
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                            </>
                          )}

                          {canRemoveMember(member) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.name} from this organization?
                                    They will lose access to all resources and data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeMember(member.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                    disabled={removingMember === member.id}
                                  >
                                    {removingMember === member.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Removing...
                                      </>
                                    ) : (
                                      'Remove Member'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!canManageMembers && (
        <Card>
          <CardContent className="flex items-center justify-center py-4">
            <p className="text-sm text-muted-foreground text-center">
              You don't have permission to manage team members.
              <br />
              Contact an administrator to invite new members.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}