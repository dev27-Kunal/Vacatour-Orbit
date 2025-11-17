/**
 * Budget Dashboard Component
 * Overview with hierarchy visualization and key metrics
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { budgetApi, budgetQueryKeys } from '@/lib/api/budgets';
import { BudgetCategory, BudgetStatus } from '@shared/types/budget';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';

interface BudgetDashboardProps {
  onCreateBudget?: () => void;
  onViewBudget?: (budgetId: string) => void;
}

export function BudgetDashboard({ onCreateBudget, onViewBudget }: BudgetDashboardProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<BudgetCategory | 'all'>('all');

  // Fetch consolidated view
  const { data: consolidated, isLoading: consolidatedLoading } = useQuery({
    queryKey: budgetQueryKeys.consolidated(),
    queryFn: () => budgetApi.getConsolidated(),
  });

  // Fetch budgets list
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: budgetQueryKeys.list({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: 'ACTIVE',
    }),
    queryFn: () =>
      budgetApi.list({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: 'ACTIVE',
      }),
  });

  const isLoading = consolidatedLoading || budgetsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const summary = consolidated?.data?.summary || {
    totalBudgets: 0,
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallUtilization: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">
            Track and manage budgets across your organization
          </p>
        </div>
        {onCreateBudget && (
          <Button onClick={onCreateBudget}>
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{summary.totalAllocated.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalBudgets} active budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{summary.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.overallUtilization}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{summary.totalRemaining.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((summary.totalRemaining / summary.totalAllocated) * 100)}% available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets?.data?.budgets.filter((b) => b.remainingAmount < 0).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Over budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Budgets List */}
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ANNUAL">Annual</TabsTrigger>
          <TabsTrigger value="QUARTERLY">Quarterly</TabsTrigger>
          <TabsTrigger value="DEPARTMENT">Department</TabsTrigger>
          <TabsTrigger value="PROJECT">Project</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {budgets?.data?.budgets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No budgets found</p>
                {onCreateBudget && (
                  <Button onClick={onCreateBudget} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Budget
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {budgets?.data?.budgets.map((budget) => {
                const utilization = Math.round(
                  (budget.spentAmount / budget.totalAmount) * 100
                );
                const isOverBudget = budget.spentAmount > budget.totalAmount;

                return (
                  <Card
                    key={budget.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onViewBudget?.(budget.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle>{budget.name}</CardTitle>
                          <Badge variant={isOverBudget ? 'destructive' : 'default'}>
                            {budget.category}
                          </Badge>
                        </div>
                        <Badge
                          variant={
                            budget.status === 'ACTIVE'
                              ? 'default'
                              : budget.status === 'DEPLETED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {budget.status}
                        </Badge>
                      </div>
                      {budget.description && (
                        <CardDescription>{budget.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Progress bar */}
                        <div className="flex items-center justify-between text-sm">
                          <span>Utilization</span>
                          <span className="font-medium">{utilization}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverBudget
                                ? 'bg-destructive'
                                : utilization > 90
                                ? 'bg-yellow-500'
                                : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>

                        {/* Budget amounts */}
                        <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">
                              €{budget.totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Spent</p>
                            <p className="font-medium">
                              €{budget.spentAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p
                              className={`font-medium ${
                                isOverBudget ? 'text-destructive' : ''
                              }`}
                            >
                              €{budget.remainingAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
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
  );
}

export default BudgetDashboard;
