import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Plus, Edit, Copy, Trash2, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'permanent' | 'temporary' | 'freelance' | 'consultancy';
  version: string;
  clauses: number;
  lastModified: string;
  isActive: boolean;
}

export default function ContractTemplatesPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'permanent' as const,
  });

  // Fetch templates
  const { data: templates = [], isLoading, error, refetch } = useQuery<ContractTemplate[]>({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const response = await apiGet<ContractTemplate[]>('/api/vms/contract-templates');
      return response.data || [];
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: typeof newTemplate) => {
      const response = await apiPost('/api/vms/contract-templates', {
        name: template.name,
        description: template.description,
        contractType: template.category.toUpperCase(),
        templateContent: 'Default template content',
        variables: {},
        requiresApproval: false,
        isActive: true,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create template');
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Template created',
        description: 'Contract template has been created successfully.',
      });
      setNewTemplate({ name: '', description: '', category: 'permanent' });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create template',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Duplicate template mutation
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiPost(`/api/vms/contract-templates/${templateId}/clone`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to duplicate template');
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Template duplicated',
        description: 'A copy of the template has been created.',
      });
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to duplicate template',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiDelete(`/api/vms/contract-templates/${templateId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete template');
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Template deleted',
        description: 'Contract template has been deleted.',
      });
      setSelectedTemplate(null);
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete template',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {return;}
    createTemplateMutation.mutate(newTemplate);
  };

  const getCategoryBadgeVariant = (category: ContractTemplate['category']) => {
    switch (category) {
      case 'permanent':
        return 'default';
      case 'temporary':
        return 'secondary';
      case 'freelance':
        return 'outline';
      case 'consultancy':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const categoryStats = {
    permanent: templates.filter((t) => t.category === 'permanent').length,
    temporary: templates.filter((t) => t.category === 'temporary').length,
    freelance: templates.filter((t) => t.category === 'freelance').length,
    consultancy: templates.filter((t) => t.category === 'consultancy').length,
  };

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading templates</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message || 'Failed to load contract templates. Please try again.'}</span>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('navigation.contractTemplates')}</h1>
          <p className="text-muted-foreground">{t('contracts.templates.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('contracts.templates.newTemplate')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('contracts.templates.createTitle')}</DialogTitle>
              <DialogDescription>{t('contracts.templates.createDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('contracts.templates.nameLabel')}</label>
                <Input
                  placeholder={t('contracts.templates.namePlaceholder')}
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('contracts.templates.descLabel')}</label>
                <Textarea
                  placeholder={t('contracts.templates.descPlaceholder')}
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value: any) =>
                    setNewTemplate({ ...newTemplate, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="consultancy">Consultancy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewTemplate({ name: '', description: '', category: 'permanent' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name.trim() || createTemplateMutation.isPending}
              >
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Permanent</CardDescription>
            <CardTitle className="text-3xl">{categoryStats.permanent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Temporary</CardDescription>
            <CardTitle className="text-3xl">{categoryStats.temporary}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Freelance</CardDescription>
            <CardTitle className="text-3xl">{categoryStats.freelance}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Consultancy</CardDescription>
            <CardTitle className="text-3xl">{categoryStats.consultancy}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No templates yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first contract template to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <Badge variant={getCategoryBadgeVariant(template.category)}>
                    {template.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-medium">{template.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clauses:</span>
                    <span className="font-medium">{template.clauses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modified:</span>
                    <span className="font-medium">
                      {new Date(template.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateTemplateMutation.mutate(template.id);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this template?')) {
                        deleteTemplateMutation.mutate(template.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
