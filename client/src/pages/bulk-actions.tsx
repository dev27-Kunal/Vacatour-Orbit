import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet, apiPost } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Zap, CheckSquare, XCircle, Send, Archive, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface BulkAction {
  id: string;
  type: 'approve' | 'reject' | 'archive' | 'notify';
  targetType: 'applications' | 'candidates' | 'jobs';
  itemCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface SelectableItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
}

export default function BulkActionsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'archive' | 'notify'>('approve');

  // Fetch bulk actions history
  const { data: actions = [], isLoading: isLoadingActions, error: actionsError, refetch: refetchActions } = useQuery<BulkAction[]>({
    queryKey: ['bulk-actions'],
    queryFn: async () => {
      const response = await apiGet<BulkAction[]>('/api/vms/workflows/bulk-actions');
      return response.data || [];
    },
  });

  // Fetch items that can be bulk-actioned
  const { data: items = [], isLoading: isLoadingItems, error: itemsError, refetch: refetchItems } = useQuery<SelectableItem[]>({
    queryKey: ['bulk-action-items'],
    queryFn: async () => {
      const response = await apiGet<SelectableItem[]>('/api/vms/workflows/bulk-actions/items');
      return response.data || [];
    },
  });

  // Execute bulk action mutation
  const executeBulkActionMutation = useMutation({
    mutationFn: async (data: { action: string; itemIds: string[] }) => {
      const response = await apiPost('/api/vms/workflows/bulk-actions/execute', data);
      if (!response.success) {throw new Error(t('bulkActions.errors.executeFailed'));}
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: t('bulkActions.toast.queued.title'),
        description: t('bulkActions.toast.queued.desc', { count: selectedItems.size }),
      });
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ['bulk-actions'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-action-items'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('bulkActions.toast.failed.title'),
        description: error.message || t('bulkActions.toast.failed.desc'),
        variant: 'destructive',
      });
    },
  });

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleExecuteBulkAction = () => {
    if (selectedItems.size === 0) {return;}

    const confirmMessage = t('bulkActions.confirm', {
      action: t(`bulkActions.actionTypes.${actionType}`),
      count: selectedItems.size,
    });
    if (!confirm(confirmMessage)) {return;}

    executeBulkActionMutation.mutate({
      action: actionType,
      itemIds: Array.from(selectedItems),
    });
  };

  const getStatusBadgeVariant = (status: BulkAction['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getActionIcon = (type: BulkAction['type']) => {
    switch (type) {
      case 'approve':
        return <CheckSquare className="h-4 w-4" />;
      case 'reject':
        return <XCircle className="h-4 w-4" />;
      case 'archive':
        return <Archive className="h-4 w-4" />;
      case 'notify':
        return <Send className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const stats = {
    pending: actions.filter((a) => a.status === 'pending').length,
    processing: actions.filter((a) => a.status === 'processing').length,
    completed: actions.filter((a) => a.status === 'completed').length,
    failed: actions.filter((a) => a.status === 'failed').length,
  };

  // Handle error states
  if (itemsError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('bulkActions.errors.items.title')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{itemsError.message || t('bulkActions.errors.items.description')}</span>
            <Button onClick={() => refetchItems()} variant="outline" size="sm" className="ml-2">
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('navigation.bulkActions')}</h1>
        <p className="text-muted-foreground">{t('bulkActions.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('bulkActions.select.title')}</CardTitle>
                  <CardDescription>
                    {t('bulkActions.select.count', { selected: selectedItems.size, total: items.length })}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleToggleAll}>
                  {selectedItems.size === items.length ? t('bulkActions.select.deselectAll') : t('bulkActions.select.selectAll')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingItems ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('bulkActions.select.emptyTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('bulkActions.select.emptyDesc')}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => handleToggleItem(item.id)}
                    >
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                      <Badge variant="secondary">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t('bulkActions.actionPanel.title')}
              </CardTitle>
              <CardDescription>{t('bulkActions.actionPanel.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('bulkActions.form.actionType')}</label>
                  <Select value={actionType} onValueChange={(value: any) => setActionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">
                        <span className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4" />
                          {t('bulkActions.actionTypes.approve')}
                        </span>
                      </SelectItem>
                      <SelectItem value="reject">
                        <span className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {t('bulkActions.actionTypes.reject')}
                        </span>
                      </SelectItem>
                      <SelectItem value="archive">
                        <span className="flex items-center gap-2">
                          <Archive className="h-4 w-4" />
                          {t('bulkActions.actionTypes.archive')}
                        </span>
                      </SelectItem>
                      <SelectItem value="notify">
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          {t('bulkActions.actionTypes.notify')}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-2">{t('bulkActions.summary.title')}</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      • {t('bulkActions.summary.action')} <span className="font-medium text-foreground">{t(`bulkActions.actionTypes.${actionType}`)}</span>
                    </p>
                    <p>
                      • {t('bulkActions.summary.selected', { count: selectedItems.size })}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedItems.size === 0 || executeBulkActionMutation.isPending}
                  onClick={handleExecuteBulkAction}
                >
                  {executeBulkActionMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('bulkActions.buttons.processing')}
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      {t('bulkActions.buttons.execute')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('bulkActions.history.title')}</CardTitle>
          <CardDescription>{t('bulkActions.history.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recent">{t('bulkActions.history.tabs.recent')}</TabsTrigger>
              <TabsTrigger value="processing">{t('bulkActions.history.tabs.processing', { count: stats.processing })}</TabsTrigger>
              <TabsTrigger value="completed">{t('bulkActions.history.tabs.completed', { count: stats.completed })}</TabsTrigger>
              <TabsTrigger value="failed">{t('bulkActions.history.tabs.failed', { count: stats.failed })}</TabsTrigger>
            </TabsList>

            {['recent', 'processing', 'completed', 'failed'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-2 mt-4">
                {actionsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>{t('bulkActions.errors.history.title')}</span>
                      <Button onClick={() => refetchActions()} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t('common.retry')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : isLoadingActions ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : actions.filter((a) =>
                    tab === 'recent' ? true : a.status === tab
                  ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {tab === 'recent' ? t('bulkActions.history.empty.recent.title') : t(`bulkActions.history.empty.${tab}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tab === 'recent' ? t('bulkActions.history.empty.recent.desc') : t(`bulkActions.history.empty.${tab}.desc`)}
                    </p>
                  </div>
                ) : (
                  actions
                    .filter((a) => (tab === 'recent' ? true : a.status === tab))
                    .map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getActionIcon(action.type)}
                          <div>
                            <p className="font-medium capitalize">
                              {t(`bulkActions.actionTypes.${action.type}`)} {t(`bulkActions.targetTypes.${action.targetType}`)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {action.itemCount} {t('bulkActions.items')} •{' '}
                              {new Date(action.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(action.status)}>
                          {t(`bulkActions.status.${action.status}`)}
                        </Badge>
                      </div>
                    ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
