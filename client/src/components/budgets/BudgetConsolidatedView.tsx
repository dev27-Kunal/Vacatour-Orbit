/**
 * Budget Consolidated View Component
 * Tenant-level budget rollup for executives
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { budgetApi, budgetQueryKeys } from '@/lib/api/budgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function BudgetConsolidatedView() {
  const { data, isLoading } = useQuery({
    queryKey: budgetQueryKeys.consolidated(),
    queryFn: () => budgetApi.getConsolidated(),
  });

  if (isLoading) {return <div className="animate-pulse h-64 bg-muted rounded"></div>;}

  const byCategory = data?.data?.byCategory || [];
  const summary = data?.data?.summary;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const chartData = byCategory.map((cat: any, idx: number) => ({
    name: cat.category,
    value: cat.totalSpent,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consolidated Budget View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">By Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: €${(entry.value / 1000).toFixed(0)}k`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Total Budgets</span>
                <span className="font-bold">{summary?.totalBudgets}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Total Allocated</span>
                <span className="font-bold">€{summary?.totalAllocated?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Total Spent</span>
                <span className="font-bold">€{summary?.totalSpent?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>Total Remaining</span>
                <span className="font-bold">€{summary?.totalRemaining?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-primary text-primary-foreground rounded">
                <span>Overall Utilization</span>
                <span className="font-bold">{summary?.overallUtilization}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BudgetConsolidatedView;
