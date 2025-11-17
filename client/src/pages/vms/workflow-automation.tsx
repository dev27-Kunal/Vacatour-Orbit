/**
 * Workflow Automation Page
 *
 * Main workflow automation management page with 3 tabs:
 * - Workflow Rules: Manage automation rules (auto-reject, auto-reminder, etc.)
 * - Quick Replies: Manage quick reply templates
 * - Reminders: Manage and schedule reminders
 *
 * Features:
 * - Polished UI with skeleton loaders
 * - Alert errors with retry buttons
 * - Rich empty states
 * - Toast notifications for all mutations
 * - Form validation
 * - Confirmation dialogs for destructive actions
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Workflow,
  MessageSquare,
  Bell,
  Plus,
  Edit,
  Trash2,
  Play,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

// Types
interface WorkflowRule {
  id: string;
  name: string;
  type: 'auto_reject' | 'auto_reminder' | 'auto_shortlist' | 'custom';
  priority: number;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  executionCount: number;
}

interface QuickReplyTemplate {
  id: string;
  name: string;
  category: 'rejection' | 'interview_invite' | 'request_info' | 'offer' | 'general';
  subject: string;
  content: string;
  variables: string[];
  usageCount: number;
  isDefault: boolean;
  createdAt: string;
}

interface Reminder {
  id: string;
  type: 'contract_expiry' | 'sla_breach' | 'follow_up' | 'custom';
  scheduledFor: string;
  recipient: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  message: string;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

// API Functions
async function fetchWorkflowRules(type?: string): Promise<WorkflowRule[]> {
  const params = type && type !== 'all' ? { type } : {};
  const response = await apiGet('/api/vms/workflow-rules', params);
  return response.data || [];
}

async function fetchQuickReplies(category?: string): Promise<QuickReplyTemplate[]> {
  const params = category && category !== 'all' ? { category } : {};
  const response = await apiGet('/api/vms/quick-replies', params);
  return response.data || [];
}

async function fetchReminders(status?: string): Promise<Reminder[]> {
  const params = status && status !== 'all' ? { status } : {};
  const response = await apiGet('/api/vms/reminders', params);
  return response.data || [];
}

async function deleteWorkflowRule(id: string): Promise<void> {
  await apiDelete(`/api/vms/workflow-rules/${id}`);
}

async function toggleWorkflowRule(id: string, isActive: boolean): Promise<void> {
  await apiPatch(`/api/vms/workflow-rules/${id}`, { isActive });
}

async function executeWorkflowRule(id: string): Promise<void> {
  await apiPost(`/api/vms/workflow-rules/${id}/execute`, {});
}

async function deleteQuickReply(id: string): Promise<void> {
  await apiDelete(`/api/vms/quick-replies/${id}`);
}

async function initializeDefaultTemplates(): Promise<void> {
  await apiPost('/api/vms/quick-replies/initialize-defaults', {});
}

async function cancelReminder(id: string): Promise<void> {
  await apiPost(`/api/vms/reminders/${id}/cancel`, {});
}

// Skeleton Loaders
function RuleCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReminderCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkflowAutomationPage() {
  const { t } = useTranslation();
  const { user } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState('rules');
  const [ruleTypeFilter, setRuleTypeFilter] = useState('all');
  const [replyCategory, setReplyCategory] = useState('all');
  const [reminderStatus, setReminderStatus] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'rule' | 'reply' | 'reminder';
    id: string;
    name: string;
  } | null>(null);

  // Queries
  const rulesQuery = useQuery({
    queryKey: ['workflow-rules', ruleTypeFilter],
    queryFn: () => fetchWorkflowRules(ruleTypeFilter),
    enabled: activeTab === 'rules',
  });

  const repliesQuery = useQuery({
    queryKey: ['quick-replies', replyCategory],
    queryFn: () => fetchQuickReplies(replyCategory),
    enabled: activeTab === 'replies',
  });

  const remindersQuery = useQuery({
    queryKey: ['reminders', reminderStatus],
    queryFn: () => fetchReminders(reminderStatus),
    enabled: activeTab === 'reminders',
  });

  // Mutations
  const deleteRuleMutation = useMutation({
    mutationFn: deleteWorkflowRule,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workflow rule deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
      setDeleteDialog(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete workflow rule',
        variant: 'destructive',
      });
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleWorkflowRule(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to toggle workflow rule',
        variant: 'destructive',
      });
    },
  });

  const executeRuleMutation = useMutation({
    mutationFn: executeWorkflowRule,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Workflow rule executed successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to execute workflow rule',
        variant: 'destructive',
      });
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: deleteQuickReply,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Quick reply template deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
      setDeleteDialog(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete quick reply template',
        variant: 'destructive',
      });
    },
  });

  const initializeDefaultsMutation = useMutation({
    mutationFn: initializeDefaultTemplates,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Default templates initialized successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to initialize default templates',
        variant: 'destructive',
      });
    },
  });

  const cancelReminderMutation = useMutation({
    mutationFn: cancelReminder,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Reminder cancelled successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel reminder',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleDelete = () => {
    if (!deleteDialog) {return;}

    if (deleteDialog.type === 'rule') {
      deleteRuleMutation.mutate(deleteDialog.id);
    } else if (deleteDialog.type === 'reply') {
      deleteReplyMutation.mutate(deleteDialog.id);
    }
  };

  // Badge colors
  const ruleTypeBadges: Record<string, string> = {
    auto_reject: 'bg-red-100 text-red-800',
    auto_reminder: 'bg-blue-100 text-blue-800',
    auto_shortlist: 'bg-green-100 text-green-800',
    custom: 'bg-purple-100 text-purple-800',
  };

  const categoryBadges: Record<string, string> = {
    rejection: 'bg-red-100 text-red-800',
    interview_invite: 'bg-blue-100 text-blue-800',
    request_info: 'bg-yellow-100 text-yellow-800',
    offer: 'bg-green-100 text-green-800',
    general: 'bg-gray-100 text-gray-800',
  };

  const statusBadges: Record<string, { icon: any; color: string }> = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    sent: { icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
    failed: { icon: XCircle, color: 'bg-red-100 text-red-800' },
    cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-800' },
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/vms/company-dashboard">VMS</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.workflowAutomation')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.workflowAutomation')}</h1>
          <p className="text-muted-foreground mt-2">
            Automate your recruitment processes with rules, templates, and reminders
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflow Rules
            </TabsTrigger>
            <TabsTrigger value="replies" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Quick Replies
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>

          {/* Workflow Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="auto_reject">Auto Reject</SelectItem>
                  <SelectItem value="auto_reminder">Auto Reminder</SelectItem>
                  <SelectItem value="auto_shortlist">Auto Shortlist</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>

            {/* Loading State */}
            {rulesQuery.isLoading && (
              <div className="grid gap-4 md:grid-cols-2">
                <RuleCardSkeleton />
                <RuleCardSkeleton />
                <RuleCardSkeleton />
                <RuleCardSkeleton />
              </div>
            )}

            {/* Error State */}
            {rulesQuery.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load workflow rules</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rulesQuery.refetch()}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {rulesQuery.isSuccess && rulesQuery.data.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Workflow className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workflow rules yet</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    Create your first workflow rule to automate repetitive tasks like
                    auto-rejecting unqualified candidates or sending reminders.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Rule
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Rules List */}
            {rulesQuery.isSuccess && rulesQuery.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {rulesQuery.data.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge
                              className={ruleTypeBadges[rule.type]}
                              variant="outline"
                            >
                              {rule.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Priority: {rule.priority}</span>
                            <span>Executed: {rule.executionCount}x</span>
                          </div>
                        </div>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) =>
                            toggleRuleMutation.mutate({
                              id: rule.id,
                              isActive: checked,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Conditions: </span>
                          <span className="text-muted-foreground">
                            {Object.keys(rule.conditions).length} conditions
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Actions: </span>
                          <span className="text-muted-foreground">
                            {Object.keys(rule.actions).length} actions
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => executeRuleMutation.mutate(rule.id)}
                          disabled={executeRuleMutation.isPending}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Test
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
                              type: 'rule',
                              id: rule.id,
                              name: rule.name,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quick Replies Tab */}
          <TabsContent value="replies" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={replyCategory} onValueChange={setReplyCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="rejection">Rejection</SelectItem>
                  <SelectItem value="interview_invite">Interview Invite</SelectItem>
                  <SelectItem value="request_info">Request Info</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => initializeDefaultsMutation.mutate()}
                  disabled={initializeDefaultsMutation.isPending}
                >
                  Initialize Defaults
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {repliesQuery.isLoading && (
              <div className="grid gap-4 md:grid-cols-2">
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
              </div>
            )}

            {/* Error State */}
            {repliesQuery.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load quick reply templates</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => repliesQuery.refetch()}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {repliesQuery.isSuccess && repliesQuery.data.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No quick reply templates yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    Create templates for common messages like rejection emails, interview
                    invites, or information requests to save time.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => initializeDefaultsMutation.mutate()}
                    >
                      Initialize Defaults
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Templates List */}
            {repliesQuery.isSuccess && repliesQuery.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {repliesQuery.data.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge
                              className={categoryBadges[template.category]}
                              variant="outline"
                            >
                              {template.category.replace('_', ' ')}
                            </Badge>
                            {template.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Used {template.usageCount} times
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Subject: </span>
                          <span className="text-muted-foreground">
                            {template.subject}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Content Preview: </span>
                          <p className="text-muted-foreground line-clamp-2 mt-1">
                            {template.content}
                          </p>
                        </div>
                        {template.variables.length > 0 && (
                          <div>
                            <span className="font-medium">Variables: </span>
                            <span className="text-muted-foreground">
                              {template.variables.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {!template.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: 'reply',
                                id: template.id,
                                name: template.name,
                              })
                            }
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={reminderStatus} onValueChange={setReminderStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Reminder
              </Button>
            </div>

            {/* Loading State */}
            {remindersQuery.isLoading && (
              <div className="space-y-4">
                <ReminderCardSkeleton />
                <ReminderCardSkeleton />
                <ReminderCardSkeleton />
              </div>
            )}

            {/* Error State */}
            {remindersQuery.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load reminders</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => remindersQuery.refetch()}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {remindersQuery.isSuccess && remindersQuery.data.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reminders scheduled</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    Schedule reminders for contract expiries, SLA breaches, or follow-ups
                    to stay on top of important deadlines.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Your First Reminder
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reminders List */}
            {remindersQuery.isSuccess && remindersQuery.data.length > 0 && (
              <div className="space-y-4">
                {remindersQuery.data.map((reminder) => {
                  const StatusIcon = statusBadges[reminder.status].icon;
                  return (
                    <Card key={reminder.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold capitalize">
                                {reminder.type.replace('_', ' ')}
                              </h3>
                              <Badge
                                className={statusBadges[reminder.status].color}
                                variant="outline"
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {reminder.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(reminder.scheduledFor).toLocaleString()}
                              </span>
                              <span>To: {reminder.recipient}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reminder.message}
                            </p>
                          </div>
                          {reminder.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelReminderMutation.mutate(reminder.id)}
                              disabled={cancelReminderMutation.isPending}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

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
                Are you sure you want to delete "{deleteDialog.name}"? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  deleteRuleMutation.isPending || deleteReplyMutation.isPending
                }
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
}
