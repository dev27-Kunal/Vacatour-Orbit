/**
 * Candidate Submission Form Component
 *
 * Form for bureaus to submit candidates to distributed jobs
 * Features:
 * - Full candidate information capture
 * - Duplicate candidate detection warning
 * - Automatic ownership tracking display
 * - React Hook Form + Zod validation
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiPost, ApiError } from '@/lib/api-client';
import { Loader2, AlertTriangle, CheckCircle, Upload, User } from 'lucide-react';

const candidateSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  cvUrl: z.string().url('Invalid CV URL').optional().or(z.literal('')),
  skills: z.string().optional(),
  experience: z.string().optional(),
  availability: z.string().optional(),
  hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
  salaryExpectation: z.number().positive('Salary expectation must be positive').optional(),
  notes: z.string().optional(),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

interface DuplicateWarning {
  candidateId: string;
  matchReason: 'EMAIL' | 'PHONE' | 'NAME' | 'MULTIPLE';
  existingBureauId?: string;
  ownershipExpiresAt?: string;
}

interface Ownership {
  bureauId: string;
  bureauName: string;
  submittedAt: string;
  ownershipExpiresAt: string;
  feeProtected: boolean;
}

interface CandidateSubmissionFormProps {
  jobId: string;
  distributionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CandidateSubmissionForm({
  jobId,
  distributionId,
  onSuccess,
  onCancel,
}: CandidateSubmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);
  const [ownership, setOwnership] = useState<Ownership | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const { toast } = useToast();

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      linkedinUrl: '',
      cvUrl: '',
      skills: '',
      experience: '',
      availability: '',
      notes: '',
    },
  });

  // Check for duplicate candidates when email changes
  const emailValue = form.watch('email');
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!emailValue || !z.string().email().safeParse(emailValue).success) {
        setDuplicateWarning(null);
        setOwnership(null);
        return;
      }

      setCheckingDuplicate(true);
      try {
        const data = await apiPost(`/api/vms/candidates/check-duplicate`, { email: emailValue });
        if (data.data.isDuplicate) {
          setDuplicateWarning(data.data.duplicate);
          if (data.data.ownership) {
            setOwnership(data.data.ownership);
          }
        } else {
          setDuplicateWarning(null);
          setOwnership(null);
        }
      } catch (error) {
        console.error('Error checking duplicate:', error);
      } finally {
        setCheckingDuplicate(false);
      }
    };

    const timer = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timer);
  }, [emailValue]);

  const onSubmit = async (data: CandidateFormData) => {
    setLoading(true);
    try {
      // Parse skills into array
      const skillsArray = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...data,
        skills: skillsArray,
        jobId,
        distributionId,
      };

      await apiPost('/api/vms/candidates', payload);

      toast({
        title: 'Success',
        description: 'Candidate submitted successfully',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to submit candidate',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Submit Candidate
        </CardTitle>
        <CardDescription>
          Submit a candidate for this position. All fields marked with * are required.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Duplicate Warning */}
            {duplicateWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Duplicate Candidate Detected</AlertTitle>
                <AlertDescription>
                  This candidate already exists in the system (matched by {duplicateWarning.matchReason.toLowerCase()}).
                  {ownership && (
                    <div className="mt-2 text-sm">
                      <strong>Ownership Information:</strong>
                      <div>Bureau: {ownership.bureauName}</div>
                      <div>Submitted: {new Date(ownership.submittedAt).toLocaleDateString()}</div>
                      <div>Fee Protected Until: {new Date(ownership.ownershipExpiresAt).toLocaleDateString()}</div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Personal Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="john.doe@example.com" {...field} />
                        {checkingDuplicate && (
                          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>We'll check for duplicate candidates</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+31 6 12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Professional Information</h3>

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/cv.pdf" {...field} />
                    </FormControl>
                    <FormDescription>Link to the candidate's CV or resume</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="JavaScript, React, Node.js, TypeScript" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list of skills</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the candidate's relevant experience..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Compensation & Availability */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Compensation & Availability</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="75"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryExpectation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Expectation (€/year)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <FormControl>
                      <Input placeholder="Available immediately / 2 weeks notice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about the candidate..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading || !!duplicateWarning}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Candidate
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
