import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Settings, Building2, Upload, Trash2, Loader2, Save } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const updateTenantSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(50, 'Organization name must be less than 50 characters'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
});

type UpdateTenantForm = z.infer<typeof updateTenantSchema>;

export function TenantSettings() {
  const { currentTenant, currentMembership, updateTenant, isLoading } = useTenant();
  const { toast } = useToast();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const form = useForm<UpdateTenantForm>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues: {
      name: '',
      description: '',
      logo_url: '',
    },
  });

  // Update form when tenant data loads
  useEffect(() => {
    if (currentTenant) {
      form.reset({
        name: currentTenant.name,
        description: currentTenant.description || '',
        logo_url: currentTenant.logo_url || '',
      });
    }
  }, [currentTenant, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const getTenantInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onSubmit = async (data: UpdateTenantForm) => {
    const success = await updateTenant(data);
    if (success) {
      setIsDirty(false);
      toast({
        title: 'Success',
        description: 'Organization settings updated successfully',
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {return;}

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select a valid image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image must be smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploadingLogo(true);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('logo', file);

      // Upload to your backend endpoint
      const response = await fetch(`/api/tenants/current/logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        let errorMessage = 'Failed to upload logo. Please try again.';

        if (response.status === 400) {
          errorMessage = data.message || 'Invalid file. Please check file type and size.';
        } else if (response.status === 401) {
          errorMessage = 'You do not have permission to upload logo.';
        } else if (response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 2MB.';
        }

        throw new Error(errorMessage);
      }

      if (data.success && data.data?.logo_url) {
        form.setValue('logo_url', data.data.logo_url, { shouldValidate: true });
        setIsDirty(true);

        toast({
          title: 'Success',
          description: 'Logo uploaded successfully',
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    form.setValue('logo_url', '', { shouldValidate: true });
    setIsDirty(true);
  };

  if (!currentTenant) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Settings className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No organization selected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canEditSettings = currentMembership?.role === 'OWNER' || currentMembership?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Settings</h2>
          <p className="text-muted-foreground">
            Manage your organization's information and preferences
          </p>
        </div>
        {currentMembership && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {currentMembership.role}
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your organization's basic details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Section */}
              <div className="space-y-4">
                <FormLabel>Organization Logo</FormLabel>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={form.watch('logo_url')} 
                      alt={currentTenant.name}
                    />
                    <AvatarFallback className="text-lg font-medium">
                      {getTenantInitials(currentTenant.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    {canEditSettings && (
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploadingLogo}
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Logo
                            </>
                          )}
                        </Button>
                        
                        {form.watch('logo_url') && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveLogo}
                            disabled={isUploadingLogo}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Recommended: Square image, at least 200x200 pixels
                    </p>
                    
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo || !canEditSettings}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Organization Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter organization name"
                        disabled={!canEditSettings}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the display name for your organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your organization..."
                        className="resize-none"
                        rows={3}
                        disabled={!canEditSettings}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description that appears on your organization profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Read-only information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <FormLabel>Organization ID</FormLabel>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {currentTenant.id}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <FormLabel>Slug</FormLabel>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {currentTenant.slug}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <FormLabel>Status</FormLabel>
                  <Badge 
                    variant={currentTenant.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {currentTenant.status}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <FormLabel>Created</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentTenant.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {canEditSettings && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {isDirty && 'You have unsaved changes'}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setIsDirty(false);
                  }}
                  disabled={!isDirty || isLoading}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit"
                  disabled={!isDirty || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!canEditSettings && (
            <Card>
              <CardContent className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground text-center">
                  You don't have permission to edit organization settings.
                  <br />
                  Contact an administrator to make changes.
                </p>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}