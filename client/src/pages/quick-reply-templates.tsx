import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-supabase-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuickReplyTemplateSchema } from "@shared/schema";
import { Plus, Edit2, Trash2, MessageSquare, ChevronLeft } from "lucide-react";
import type { QuickReplyTemplate } from "@shared/schema";
import { PageWrapper } from "@/components/page-wrapper";
import { apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { useApp } from "@/providers/AppProvider";

export default function QuickReplyTemplates() {
  const { user } = useApp();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuickReplyTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<QuickReplyTemplate | null>(null);

  // Check if user has access (only BEDRIJF users)
  useEffect(() => {
    if (!user || user.userType !== 'BEDRIJF') {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery<QuickReplyTemplate[]>({
    queryKey: ["/api/quick-reply-templates"],
    enabled: !!user && user.userType === 'BEDRIJF',
  });

  // Create/Update template form
  const form = useForm({
    resolver: zodResolver(insertQuickReplyTemplateSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      console.log("Sending request to create template:", data);
      const response = await apiPost("/api/quick-reply-templates", data);

      console.log("API Response:", response);

      if (!response.success) {
        throw new Error(response.error || "Failed to create template");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Template created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/quick-reply-templates"] });
      toast({
        title: t('templates.templateCreated'),
        description: t('templates.templateCreatedMessage'),
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error creating template:", error);
      toast({
        title: t('templates.error'),
        description: error.message || t('templates.errorCreating'),
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; content: string } }) => {
      const response = await apiPatch(`/api/quick-reply-templates/${id}`, data);

      if (!response.success) {
        throw new Error(response.error || "Failed to update template");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-reply-templates"] });
      toast({
        title: t('templates.templateUpdated'),
        description: t('templates.templateUpdatedMessage'),
      });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: t('templates.error'),
        description: t('templates.errorUpdating'),
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiDelete(`/api/quick-reply-templates/${id}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete template");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-reply-templates"] });
      toast({
        title: t('templates.templateDeleted'),
        description: t('templates.templateDeletedMessage'),
      });
      setDeletingTemplate(null);
    },
    onError: () => {
      toast({
        title: t('templates.error'),
        description: t('templates.errorDeleting'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: { title: string; content: string }) => {
    console.log("Form submitted with values:", values);
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: values });
    } else {
      console.log("Creating new template...");
      createTemplateMutation.mutate(values);
    }
  };

  const handleEdit = (template: QuickReplyTemplate) => {
    setEditingTemplate(template);
    form.setValue("title", template.title);
    form.setValue("content", template.content);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    form.reset();
  };

  if (!user || user.userType !== 'BEDRIJF') {
    return null;
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
          data-testid="button-back"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t('templates.backToDashboard')}
        </Button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('templates.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('templates.subtitle')}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  form.reset();
                  setIsDialogOpen(true);
                }}
                data-testid="button-add-template"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('templates.newTemplate')}
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? t('templates.editTemplate') : t('templates.createTemplate')}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? t('templates.editTemplateDescription') 
                    : t('templates.createTemplateDescription')
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                  console.error("Form validation errors:", errors);
                  // Show validation errors as toast
                  const firstError = Object.values(errors)[0];
                  if (firstError && firstError.message) {
                    toast({
                      title: t('templates.validationError'),
                      description: firstError.message,
                      variant: "destructive",
                    });
                  }
                })} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('templates.titleLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('templates.titlePlaceholder')}
                            data-testid="input-template-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('templates.contentLabel')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('templates.contentPlaceholder')}
                            rows={5}
                            data-testid="input-template-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                      data-testid="button-cancel"
                    >
                      {t('templates.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                      data-testid="button-save-template"
                    >
                      {editingTemplate ? t('templates.update') : t('templates.create')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card className="feature-card bg-card animate-pulse" key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="feature-card bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('templates.noTemplatesFound')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('templates.noTemplatesMessage')}
            </p>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                form.reset();
                setIsDialogOpen(true);
              }}
              data-testid="button-create-first-template"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('templates.createFirstTemplate')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card className="feature-card bg-card" key={template.id} data-testid={`card-template-${template.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    {template.isDefault && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {t('templates.defaultTemplate')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!template.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(template)}
                          data-testid={`button-edit-${template.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingTemplate(template)}
                          data-testid={`button-delete-${template.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {template.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('templates.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('templates.confirmDeleteMessage', { title: deletingTemplate?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t('templates.cancelDelete')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTemplate && deleteTemplateMutation.mutate(deletingTemplate.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {t('templates.confirmDeleteButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PageWrapper>
  );
}