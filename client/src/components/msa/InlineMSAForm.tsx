/**
 * InlineMSAForm Component
 *
 * Compact form for creating MSA on-the-fly during hire blocking scenarios.
 * Embedded within MSABlockingDialog to allow immediate MSA creation.
 *
 * Features:
 * - Quick MSA creation with minimal fields
 * - Form validation with react-hook-form + zod
 * - Default values (start: today, end: 1 year, payment: 30 days)
 * - Compact 2-column layout on desktop
 * - Loading states and error handling
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiPost, ApiError } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Form validation schema
const inlineMSAFormSchema = z.object({
  effectiveDate: z.string().min(1, 'Start date is required'),
  expirationDate: z.string().min(1, 'End date is required'),
  paymentTermsDays: z.coerce.number().min(1, 'Payment terms must be at least 1 day'),
  contractValue: z.coerce.number().optional(),
}).refine((data) => {
  const start = new Date(data.effectiveDate);
  const end = new Date(data.expirationDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['expirationDate'],
});

type InlineMSAFormValues = z.infer<typeof inlineMSAFormSchema>;

interface InlineMSAFormProps {
  companyId: string;
  bureauId: string;
  bureauName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InlineMSAForm({
  companyId,
  bureauId,
  bureauName,
  onSuccess,
  onCancel,
}: InlineMSAFormProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // Calculate default dates
  const today = new Date().toISOString().split('T')[0];
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const defaultEndDate = oneYearFromNow.toISOString().split('T')[0];

  const form = useForm<InlineMSAFormValues>({
    resolver: zodResolver(inlineMSAFormSchema),
    defaultValues: {
      effectiveDate: today,
      expirationDate: defaultEndDate,
      paymentTermsDays: 30,
      contractValue: undefined,
    },
  });

  // Create MSA mutation
  const createMSAMutation = useMutation<any, ApiError, InlineMSAFormValues>({
    mutationFn: async (data) => {
      const response = await apiPost('/api/msa/create', {
        companyId,
        bureauId,
        effectiveDate: data.effectiveDate,
        expirationDate: data.expirationDate,
        paymentTermsDays: data.paymentTermsDays,
        contractValue: data.contractValue,
        // Default values for required fields
        noticePeriodDays: 30,
        autoRenew: false,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create MSA');
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: t('msa.blocking.msaCreated') || 'MSA Created',
        description: t('msa.blocking.msaCreatedDesc') || 'MSA created successfully. You can now proceed with hiring.',
        variant: 'default',
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: t('errors.general') || 'Error',
        description: error.message || 'Failed to create MSA',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InlineMSAFormValues) => {
    createMSAMutation.mutate(data);
  };

  const isLoading = createMSAMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Bureau name display */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium text-muted-foreground">
            {t('msa.blocking.creatingMSAFor') || 'Creating MSA for'}:
          </p>
          <p className="font-semibold">{bureauName}</p>
        </div>

        {/* Form fields in 2-column grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('msa.form.startDate') || 'Start Date'} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                    data-testid="input-start-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('msa.form.endDate') || 'End Date'} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                    data-testid="input-end-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Terms */}
          <FormField
            control={form.control}
            name="paymentTermsDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('msa.form.paymentTerms') || 'Payment Terms (days)'} <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-payment-terms">
                      <SelectValue placeholder={t('msa.form.selectPaymentTerms') || 'Select payment terms'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="7">7 {t('common.days') || 'days'}</SelectItem>
                    <SelectItem value="14">14 {t('common.days') || 'days'}</SelectItem>
                    <SelectItem value="30">30 {t('common.days') || 'days'}</SelectItem>
                    <SelectItem value="60">60 {t('common.days') || 'days'}</SelectItem>
                    <SelectItem value="90">90 {t('common.days') || 'days'}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contract Value (optional) */}
          <FormField
            control={form.control}
            name="contractValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('msa.form.contractValue') || 'Contract Value (optional)'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="€ 0.00"
                    min="0"
                    step="0.01"
                    {...field}
                    value={field.value ?? ''}
                    disabled={isLoading}
                    data-testid="input-contract-value"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            data-testid="button-cancel"
          >
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('msa.blocking.creating') || 'Creating...'}
              </>
            ) : (
              t('msa.blocking.createAndContinue') || 'Create MSA & Continue'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
