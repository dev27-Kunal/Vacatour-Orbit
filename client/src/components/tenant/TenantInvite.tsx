import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Mail, 
  UserPlus, 
  Send, 
  Loader2,
  Crown,
  Shield,
  Settings,
  Briefcase,
  Eye
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TenantRole } from '@/types/tenant';

const inviteMemberSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] as const, {
    required_error: 'Please select a role',
  }),
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
});

type InviteMemberForm = z.infer<typeof inviteMemberSchema>;

interface TenantInviteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface RoleInfo {
  role: TenantRole;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  permissions: string[];
}

const ROLE_INFO: RoleInfo[] = [
  {
    role: 'ADMIN',
    icon: Shield,
    title: 'Administrator',
    description: 'Full access to manage organization and members',
    permissions: ['Manage members', 'Manage jobs', 'View analytics', 'Edit settings']
  },
  {
    role: 'MANAGER',
    icon: Settings,
    title: 'Manager',
    description: 'Can manage jobs and view team analytics',
    permissions: ['Manage jobs', 'View analytics', 'View members']
  },
  {
    role: 'MEMBER',
    icon: Briefcase,
    title: 'Member',
    description: 'Can create and manage their own jobs',
    permissions: ['Create jobs', 'Manage own jobs', 'View members']
  },
  {
    role: 'VIEWER',
    icon: Eye,
    title: 'Viewer',
    description: 'Read-only access to jobs and team',
    permissions: ['View jobs', 'View members']
  }
];

export function TenantInvite({ open, onOpenChange, onSuccess }: TenantInviteProps) {
  const { currentTenant, currentMembership, inviteMember } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteMemberForm>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
      message: '',
    },
  });

  const watchedRole = form.watch('role');

  // Get available roles based on current user's role
  const getAvailableRoles = (): TenantRole[] => {
    if (currentMembership?.role === 'OWNER') {
      return ['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'];
    } else if (currentMembership?.role === 'ADMIN') {
      return ['MANAGER', 'MEMBER', 'VIEWER'];
    }
    return [];
  };

  const onSubmit = async (data: InviteMemberForm) => {
    if (!currentTenant) {return;}

    try {
      setIsSubmitting(true);
      
      const success = await inviteMember({
        email: data.email,
        role: data.role,
        message: data.message || undefined,
      });

      if (success) {
        onSuccess?.();
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  const getRoleInfo = (role: TenantRole) => {
    return ROLE_INFO.find(info => info.role === role);
  };

  const selectedRoleInfo = getRoleInfo(watchedRole);
  const availableRoles = getAvailableRoles();

  if (!currentTenant) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Invite someone to join {currentTenant.name} and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email"
                            placeholder="colleague@company.com"
                            className="pl-10"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        They'll receive an email invitation to join the organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles.map((role) => {
                            const roleInfo = getRoleInfo(role);
                            const Icon = roleInfo?.icon || Briefcase;
                            return (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center">
                                  <Icon className="mr-2 h-4 w-4" />
                                  {roleInfo?.title || role}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the appropriate access level for this person
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hi! I'd like to invite you to join our team on TalentMarkt..."
                          className="resize-none"
                          rows={3}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add a personal note to the invitation email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Role Info */}
              <div className="space-y-4">
                {selectedRoleInfo && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <selectedRoleInfo.icon className="mr-2 h-4 w-4" />
                        {selectedRoleInfo.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {selectedRoleInfo.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Permissions:</h4>
                        <div className="space-y-1">
                          {selectedRoleInfo.permissions.map((permission) => (
                            <div key={permission} className="flex items-center text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                              {permission}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {availableRoles.length === 0 && (
                  <Card>
                    <CardContent className="flex items-center justify-center py-6">
                      <div className="text-center space-y-2">
                        <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          You don't have permission to invite members
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {availableRoles.length > 0 && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}