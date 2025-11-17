/**
 * Budget Alert Configuration Component
 */

'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi, budgetQueryKeys } from '@/lib/api/budgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus } from 'lucide-react';

interface BudgetAlertConfigurationProps {
  budgetId: string;
}

export function BudgetAlertConfiguration({ budgetId }: BudgetAlertConfigurationProps) {
  const queryClient = useQueryClient();
  const [newThreshold, setNewThreshold] = React.useState('');

  const { data } = useQuery({
    queryKey: budgetQueryKeys.alerts(budgetId),
    queryFn: () => budgetApi.getAlerts(budgetId),
  });

  const addMutation = useMutation({
    mutationFn: (threshold: number) =>
      budgetApi.configureAlert(budgetId, { budgetId, thresholdPercentage: threshold }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.alerts(budgetId) });
      setNewThreshold('');
    },
  });

  const alerts = data?.data?.alerts || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert Thresholds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {alerts.map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'default'}>
                  {alert.threshold_percentage}%
                </Badge>
                <span className="text-sm">{alert.severity}</span>
              </div>
              {alert.is_triggered && (
                <Badge variant="destructive">TRIGGERED</Badge>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Threshold %"
            value={newThreshold}
            onChange={(e) => setNewThreshold(e.target.value)}
            min="1"
            max="200"
          />
          <Button
            onClick={() => {
              const threshold = parseInt(newThreshold);
              if (threshold > 0 && threshold <= 200) {
                addMutation.mutate(threshold);
              }
            }}
            disabled={!newThreshold || addMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BudgetAlertConfiguration;
