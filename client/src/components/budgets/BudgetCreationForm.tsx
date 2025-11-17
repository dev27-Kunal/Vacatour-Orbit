/**
 * Budget Creation Form Component
 * Role-based budget creation with validation
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateBudgetInputSchema, type CreateBudgetInput, BudgetCategory } from '@shared/types/budget';
import { budgetApi, budgetQueryKeys } from '@/lib/api/budgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface BudgetCreationFormProps {
  userRole: string;
  onSuccess?: (budgetId: string) => void;
  onCancel?: () => void;
}

export function BudgetCreationForm({ userRole, onSuccess, onCancel }: BudgetCreationFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateBudgetInput>({
    resolver: zodResolver(CreateBudgetInputSchema),
    defaultValues: {
      status: 'DRAFT',
      currency: 'EUR',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetApi.create(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.lists() });
        onSuccess?.(response.data.id);
      } else {
        setError(response.error || 'Failed to create budget');
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const onSubmit = (data: CreateBudgetInput) => {
    setError(null);
    createMutation.mutate(data);
  };

  // Role-based category options
  const categoryOptions: BudgetCategory[] =
    userRole === 'HIRING_MANAGER'
      ? ['DEPARTMENT']
      : ['ANNUAL', 'QUARTERLY', 'DEPARTMENT', 'PROJECT', 'MSA', 'CONTRACT'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="name">Budget Name*</Label>
        <Input id="name" {...register('name')} placeholder="e.g., Q1 2024 IT Department" />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="category">Category*</Label>
        <Select onValueChange={(value) => setValue('category', value as BudgetCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <Label htmlFor="totalAmount">Total Amount (EUR)*</Label>
        <Input
          id="totalAmount"
          type="number"
          step="0.01"
          {...register('totalAmount', { valueAsNumber: true })}
          placeholder="50000"
        />
        {errors.totalAmount && <p className="text-sm text-destructive mt-1">{errors.totalAmount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="periodStart">Period Start*</Label>
          <Input id="periodStart" type="date" {...register('periodStart')} />
          {errors.periodStart && <p className="text-sm text-destructive mt-1">{errors.periodStart.message}</p>}
        </div>
        <div>
          <Label htmlFor="periodEnd">Period End*</Label>
          <Input id="periodEnd" type="date" {...register('periodEnd')} />
          {errors.periodEnd && <p className="text-sm text-destructive mt-1">{errors.periodEnd.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="Optional description" rows={3} />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Budget
        </Button>
      </div>
    </form>
  );
}

export default BudgetCreationForm;
