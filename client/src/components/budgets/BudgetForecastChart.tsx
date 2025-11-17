/**
 * Budget Forecast Chart Component
 * Displays 90-day forecast with confidence intervals
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { budgetApi, budgetQueryKeys } from '@/lib/api/budgets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface BudgetForecastChartProps {
  budgetId: string;
  forecastDays?: number;
}

export function BudgetForecastChart({ budgetId, forecastDays = 90 }: BudgetForecastChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: budgetQueryKeys.forecast(budgetId),
    queryFn: () => budgetApi.getForecast(budgetId, forecastDays),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load forecast data</AlertDescription>
      </Alert>
    );
  }

  const forecast = data.data?.forecast || [];
  const summary = data.data?.summary;

  // Prepare chart data
  const chartData = forecast.map((f: any) => ({
    date: new Date(f.forecast_date).toLocaleDateString(),
    predicted: parseFloat(f.predicted_spend),
    lower: parseFloat(f.confidence_lower),
    upper: parseFloat(f.confidence_upper),
    budget: summary?.totalBudget,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Budget Forecast
        </CardTitle>
        <CardDescription>
          {forecastDays}-day spend prediction with 95% confidence interval
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Current Spent</p>
            <p className="text-lg font-bold">€{summary?.currentSpent?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold">€{summary?.remaining?.toLocaleString()}</p>
          </div>
          {summary?.daysUntilDepletion && (
            <>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Depletion Date
                </p>
                <p className="text-lg font-bold">
                  {new Date(summary.estimatedDepletionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Days Until Depletion
                </p>
                <p className="text-lg font-bold text-destructive">{summary.daysUntilDepletion}</p>
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.floor(forecastDays / 10)} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, '']} />
            <Legend />

            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="upper"
              stackId="1"
              stroke="none"
              fill="#8884d8"
              fillOpacity={0.1}
              name="Upper Confidence"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stackId="1"
              stroke="none"
              fill="#8884d8"
              fillOpacity={0.1}
              name="Lower Confidence"
            />

            {/* Budget line */}
            <Line
              type="monotone"
              dataKey="budget"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Total Budget"
            />

            {/* Predicted spend */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="Predicted Spend"
            />
          </ComposedChart>
        </ResponsiveContainer>

        <p className="text-xs text-muted-foreground mt-4">
          Forecast method: {summary?.forecastMethod} | Calculated: {new Date(summary?.calculatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

export default BudgetForecastChart;
