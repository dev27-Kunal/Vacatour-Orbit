import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Building2, Users, Briefcase, CheckCircle, Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiGet, ApiError } from '@/lib/api-client';

const createTenantSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(50, 'Organization name must be less than 50 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(30, 'Slug must be less than 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
});

type CreateTenantForm = z.infer<typeof createTenantSchema>;

interface TenantOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function TenantOnboarding({ open, onOpenChange, onComplete }: TenantOnboardingProps) {
  const { createTenant, isLoading } = useTenant();
  const [step, setStep] = useState(1);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const form = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const watchedName = form.watch('name');
  const watchedSlug = form.watch('slug');

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  // Check slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 2) {
      setIsSlugAvailable(null);
      return;
    }

    try {
      setIsCheckingSlug(true);
      const data = await apiGet(`/api/tenants/check-slug/${slug}`);
      setIsSlugAvailable(data.data?.available || false);
    } catch (error) {
      console.error('Failed to check slug availability:', error);
      setIsSlugAvailable(false);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Auto-update slug when name changes
  const handleNameChange = (name: string) => {
    if (!form.getValues('slug') || form.formState.touchedFields.slug === undefined) {
      const generatedSlug = generateSlug(name);
      form.setValue('slug', generatedSlug, { shouldValidate: true });
    }
  };

  // Handle slug input with debouncing
  const handleSlugChange = (slug: string) => {
    setIsSlugAvailable(null);
    
    // Debounce slug checking
    const timeoutId = setTimeout(() => {
      checkSlugAvailability(slug);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const onSubmit = async (data: CreateTenantForm) => {
    if (!isSlugAvailable) {
      form.setError('slug', { message: 'This slug is not available' });
      return;
    }

    const success = await createTenant(data);
    
    if (success) {
      setStep(3); // Success step
      setTimeout(() => {
        onOpenChange(false);
        onComplete?.();
        // Reset form for next time
        setTimeout(() => {
          setStep(1);
          form.reset();
          setIsSlugAvailable(null);
        }, 300);
      }, 2000);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setTimeout(() => {
        setStep(1);
        form.reset();
        setIsSlugAvailable(null);
      }, 300);
    }
  };

  const getProgressValue = () => {
    switch (step) {
      case 1: return 33;
      case 2: return 66;
      case 3: return 100;
      default: return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Set up your organization to get started with job management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={getProgressValue()} className="h-2" />

          {step === 1 && (
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Organization Details</CardTitle>
                <CardDescription>
                  Tell us about your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(() => setStep(2))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Acme Corporation"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleNameChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            The display name for your organization
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="A brief description of your organization..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Help others understand what your organization does
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!form.formState.isValid || !watchedName.trim()}
                    >
                      Continue
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Organization URL</CardTitle>
                <CardDescription>
                  Choose a unique identifier for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Slug</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="acme-corp"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleSlugChange(e.target.value);
                                }}
                                className={
                                  isSlugAvailable === false ? 'border-red-500' : 
                                  isSlugAvailable === true ? 'border-green-500' : ''
                                }
                              />
                              {isCheckingSlug && (
                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                              )}
                            </div>
                          </FormControl>
                          <FormDescription className="flex flex-col space-y-1">
                            <span>Your organization will be available at: jobs.example.com/{watchedSlug}</span>
                            {isSlugAvailable === true && (
                              <span className="text-green-600 text-sm">✓ This slug is available</span>
                            )}
                            {isSlugAvailable === false && (
                              <span className="text-red-600 text-sm">✗ This slug is already taken</span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setStep(1)}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={isLoading || !isSlugAvailable || !form.formState.isValid}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Organization'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg text-green-700">Organization Created!</CardTitle>
                <CardDescription>
                  Your organization has been set up successfully. You can now start managing jobs and team members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">What's next?</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Invite team members to join your organization</li>
                    <li>• Create your first job posting</li>
                    <li>• Configure your organization settings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}