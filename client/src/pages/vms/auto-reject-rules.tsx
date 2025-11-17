/**
 * Auto-Reject Rules Page
 *
 * Specialized page for managing auto-reject rules for applications.
 * Features:
 * - Create and manage auto-reject rules by vacancy
 * - Configure rejection criteria (skills match, experience, salary, etc.)
 * - Test rules with sample data
 * - View rule statistics and affected applications
 * - Polished UI with all standard patterns
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from '@/lib/api-client';
import { PageWrapper } from '@/components/page-wrapper';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Play,
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingDown,
  Info,
  MessageSquare,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

// Types
interface AutoRejectRule {
  id: string;
  name: string;
  description?: string;
  vacancyId?: string;
  vacancyTitle?: string;
  minSkillsMatch?: number;
  minExperienceYears?: number;
  maxSalaryExpectation?: number;
  requiredSkills?: string[];
  requiredEducation?: string;
  rejectionTemplateId?: string;
  rejectionTemplateName?: string;
  isActive: boolean;
  statistics: {
    totalEvaluated: number;
    totalRejected: number;
    rejectionRate: number;
  };
  createdAt: string;
}

interface Vacancy {
  id: string;
  title: string;
  status: string;
}

interface QuickReplyTemplate {
  id: string;
  name: string;
  category: string;
}

// Form Schema
const autoRejectRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  vacancyId: z.string().optional(),
  minSkillsMatch: z.number().min(0).max(100).optional(),
  minExperienceYears: z.number().min(0).max(50).optional(),
  maxSalaryExpectation: z.number().min(0).optional(),
  requiredSkills: z.array(z.string()).optional(),
  requiredEducation: z.string().optional(),
  rejectionTemplateId: z.string().optional(),
  isActive: z.boolean().default(true),
});

type AutoRejectRuleForm = z.infer<typeof autoRejectRuleSchema>;

// API Functions
async function fetchAutoRejectRules(): Promise<AutoRejectRule[]> {
  const response = await apiGet('/api/vms/auto-reject/rules');
  return response.data || [];
}

async function fetchVacancies(): Promise<Vacancy[]> {
  const response = await apiGet('/api/jobs', { status: 'active' });
  return response.jobs || [];
}

async function fetchRejectionTemplates(): Promise<QuickReplyTemplate[]> {
  const response = await apiGet('/api/vms/quick-replies', { category: 'rejection' });
  return response.data || [];
}

async function createAutoRejectRule(
  data: AutoRejectRuleForm
): Promise<AutoRejectRule> {
  return await apiPost('/api/vms/auto-reject/rules', data);
}

async function deleteAutoRejectRule(id: string): Promise<void> {
  await apiDelete(`/api/vms/auto-reject/rules/${id}`);
}

async function toggleAutoRejectRule(id: string, isActive: boolean): Promise<void> {
  await apiPatch(`/api/vms/auto-reject/rules/${id}`, { isActive });
}

async function testAutoRejectRule(
  ruleId: string,
  applicationId: string
): Promise<{ wouldReject: boolean; reason: string }> {
  return await apiPost(`/api/vms/auto-reject/evaluate/${applicationId}`, {}, { ruleId });
}

// Skeleton Loaders
function RuleCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AutoRejectRulesPage() {
  const { user } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoRejectRule | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ruleId: string;
    ruleName: string;
  } | null>(null);

  // Form
  const form = useForm<AutoRejectRuleForm>({
    resolver: zodResolver(autoRejectRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      minSkillsMatch: 50,
      minExperienceYears: 0,
      maxSalaryExpectation: undefined,
      requiredSkills: [],
      isActive: true,
    },
  });

  // Queries
  const rulesQuery = useQuery({
    queryKey: ['auto-reject-rules'],
    queryFn: fetchAutoRejectRules,
  });

  const vacanciesQuery = useQuery({
    queryKey: ['vacancies'],
    queryFn: fetchVacancies,
    enabled: showCreateDialog || !!editingRule,
  });

  const templatesQuery = useQuery({
    queryKey: ['rejection-templates'],
    queryFn: fetchRejectionTemplates,
    enabled: showCreateDialog || !!editingRule,
  });

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: createAutoRejectRule,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Auto-reject rule created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['auto-reject-rules'] });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create auto-reject rule',
        variant: 'destructive',
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteAutoRejectRule,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Auto-reject rule deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['auto-reject-rules'] });
      setDeleteDialog(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete auto-reject rule',
        variant: 'destructive',
      });
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAutoRejectRule(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-reject-rules'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to toggle auto-reject rule',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const onSubmit = (data: AutoRejectRuleForm) => {
    createRuleMutation.mutate(data);
  };

  const handleDelete = () => {
    if (!deleteDialog) {return;}
    deleteRuleMutation.mutate(deleteDialog.ruleId);
  };

  // Calculate total stats
  const totalStats = rulesQuery.data?.reduce(
    (acc, rule) => ({
      totalEvaluated: acc.totalEvaluated + rule.statistics.totalEvaluated,
      totalRejected: acc.totalRejected + rule.statistics.totalRejected,
    }),
    { totalEvaluated: 0, totalRejected: 0 }
  );

  const overallRejectionRate =
    totalStats && totalStats.totalEvaluated > 0
      ? (totalStats.totalRejected / totalStats.totalEvaluated) * 100
      : 0;

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">{t('navigation.dashboard', { defaultValue: 'Dashboard' })}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/vms/company-dashboard">{t('navigation.analytics', { defaultValue: 'Analytics' })}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('vms.autoReject.title', { defaultValue: 'Auto-Reject Rules' })}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              {t('vms.autoReject.title', { defaultValue: 'Auto-Reject Rules' })}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('vms.autoReject.subtitle', { defaultValue: "Automatically reject applications that don't meet your criteria" })}
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('vms.autoReject.createRule', { defaultValue: 'Create Rule' })}
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t('vms.autoReject.info', { defaultValue: 'Auto-reject rules help you filter out unqualified candidates automatically. Set criteria like minimum skills match, experience requirements, and salary expectations. Rejected candidates will receive a professional rejection email.' })}
          </AlertDescription>
        </Alert>

        {/* Overall Statistics */}
        {rulesQuery.isSuccess && rulesQuery.data.length > 0 && totalStats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {rulesQuery.data.filter((r) => r.isActive).length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Evaluated
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {totalStats.totalEvaluated}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Rejected
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {totalStats.totalRejected}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Rejection Rate
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {overallRejectionRate.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {rulesQuery.isLoading && (
          <div className="space-y-4">
            <RuleCardSkeleton />
            <RuleCardSkeleton />
          </div>
        )}

        {/* Error State */}
        {rulesQuery.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load auto-reject rules</span>
              <Button variant="outline" size="sm" onClick={() => rulesQuery.refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {rulesQuery.isSuccess && rulesQuery.data.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Shield className="h-20 w-20 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No auto-reject rules yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first auto-reject rule to automatically filter out candidates
                who don't meet your minimum requirements. This saves time and ensures
                consistent evaluation.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Rule
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Rules List */}
        {rulesQuery.isSuccess && rulesQuery.data.length > 0 && (
          <div className="space-y-4">
            {rulesQuery.data.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {rule.description}
                        </p>
                      )}
                      {rule.vacancyTitle && (
                        <p className="text-sm text-muted-foreground">
                          Applies to: <span className="font-medium">{rule.vacancyTitle}</span>
                        </p>
                      )}
                      {!rule.vacancyId && (
                        <p className="text-sm text-muted-foreground">
                          Applies to: <span className="font-medium">All vacancies</span>
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) =>
                        toggleRuleMutation.mutate({ id: rule.id, isActive: checked })
                      }
                    />
                  </div>

                  {/* Criteria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {rule.minSkillsMatch !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Min Skills: {rule.minSkillsMatch}%</span>
                      </div>
                    )}
                    {rule.minExperienceYears !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Min Experience: {rule.minExperienceYears} years</span>
                      </div>
                    )}
                    {rule.maxSalaryExpectation !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Max Salary: €{rule.maxSalaryExpectation.toLocaleString()}</span>
                      </div>
                    )}
                    {rule.requiredEducation && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Education: {rule.requiredEducation}</span>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg mb-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Evaluated</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {rule.statistics.totalEvaluated}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {rule.statistics.totalRejected}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {rule.statistics.rejectionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Rejection Template */}
                  {rule.rejectionTemplateName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MessageSquare className="h-4 w-4" />
                      <span>
                        Rejection template: <span className="font-medium">{rule.rejectionTemplateName}</span>
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Test Rule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          ruleId: rule.id,
                          ruleName: rule.name,
                        })
                      }
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                    <div className="flex-1" />
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(rule.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Auto-Reject Rule</DialogTitle>
            <DialogDescription>
              Configure criteria to automatically reject applications that don't meet your
              requirements
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Reject Low Experience" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this rule does..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vacancyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply to Vacancy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="All vacancies" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All vacancies</SelectItem>
                        {vacanciesQuery.data?.map((vacancy) => (
                          <SelectItem key={vacancy.id} value={vacancy.id}>
                            {vacancy.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave empty to apply to all vacancies
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minSkillsMatch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Skills Match (%)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={[field.value || 0]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                        <div className="text-sm text-muted-foreground text-center">
                          {field.value || 0}%
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Reject if candidate's skills match is below this percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minExperienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Experience (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Reject if candidate has less experience than this
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSalaryExpectation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary Expectation (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g., 75000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Reject if candidate's salary expectation exceeds this amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rejectionTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Template</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templatesQuery.data?.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Email template to use when rejecting candidates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable this rule to start auto-rejecting applications
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createRuleMutation.isPending}>
                  {createRuleMutation.isPending ? 'Creating...' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) => !open && setDeleteDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the rule "{deleteDialog.ruleName}"? This
                action cannot be undone. Applications will no longer be automatically
                rejected based on this rule.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteRuleMutation.isPending}
              >
                {deleteRuleMutation.isPending ? 'Deleting...' : 'Delete Rule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
}
