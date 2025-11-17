/**
 * Budget Allocation Widget
 * Allocate budget to MSAs, contracts, departments, projects
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateBudgetAllocationInputSchema, type CreateBudgetAllocationInput } from '@shared/types/budget';
import { budgetApi, budgetQueryKeys } from '@/lib/api/budgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BudgetAllocationWidgetProps {
  budgetId: string;
  onSuccess?: () => void;
}

export function BudgetAllocationWidget({ budgetId, onSuccess }: BudgetAllocationWidgetProps) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateBudgetAllocationInput>({
    resolver: zodResolver(CreateBudgetAllocationInputSchema),
    defaultValues: {
      budgetId,
      tenantId: '', // Will be set by backend
      isActive: true,
    },
  });

  const allocationType = watch('allocationType');

  const mutation = useMutation({
    mutationFn: (data: CreateBudgetAllocationInput) => budgetApi.allocate(budgetId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.detail(budgetId) });
        onSuccess?.();
      } else {
        setError(response.error || 'Failed to create allocation');
      }
    },
  });

  const onSubmit = (data: CreateBudgetAllocationInput) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocate Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label>Allocation Type*</Label>
            <Select onValueChange={(v) => setValue('allocationType', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MSA">Master Service Agreement</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
                <SelectItem value="DEPARTMENT">Department</SelectItem>
                <SelectItem value="PROJECT">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {allocationType === 'DEPARTMENT' && (
            <div>
              <Label>Department Name*</Label>
              <Input {...register('targetDepartment')} placeholder="e.g., IT Department" />
            </div>
          )}

          {allocationType === 'PROJECT' && (
            <div>
              <Label>Project Code*</Label>
              <Input {...register('targetProjectCode')} placeholder="e.g., PRJ-2024-001" />
            </div>
          )}

          <div>
            <Label>Allocated Amount (EUR)*</Label>
            <Input type="number" step="0.01" {...register('allocatedAmount', { valueAsNumber: true })} />
            {errors.allocatedAmount && <p className="text-sm text-destructive">{errors.allocatedAmount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid From*</Label>
              <Input type="date" {...register('validFrom')} />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input type="date" {...register('validUntil')} />
            </div>
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Allocating...' : 'Allocate Budget'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default BudgetAllocationWidget;
