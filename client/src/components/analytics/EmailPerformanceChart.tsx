import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, BarChart3, LineChart as LineChartIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface EmailMetric {
  date: string;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  emails_bounced?: number;
  emails_unsubscribed?: number;
  open_rate: number;
  click_rate: number;
  bounce_rate?: number;
  unsubscribe_rate?: number;
  delivery_rate?: number;
  click_to_open_rate?: number;
}

export interface EmailPerformanceChartProps {
  data: EmailMetric[];
  title?: string;
  description?: string;
  height?: number;
  showControls?: boolean;
  defaultChartType?: 'line' | 'area' | 'bar';
  defaultMetric?: 'volume' | 'rates' | 'engagement';
  className?: string;
}

type ChartType = 'line' | 'area' | 'bar';
type MetricType = 'volume' | 'rates' | 'engagement';

const COLORS = {
  sent: '#6366f1',
  delivered: '#10b981',
  opened: '#f59e0b',
  clicked: '#3b82f6',
  bounced: '#ef4444',
  unsubscribed: '#8b5cf6',
  openRate: '#10b981',
  clickRate: '#3b82f6',
  bounceRate: '#ef4444',
  deliveryRate: '#6366f1'
};

export const EmailPerformanceChart: React.FC<EmailPerformanceChartProps> = ({
  data,
  title = 'Email Performance',
  description,
  height = 350,
  showControls = true,
  defaultChartType = 'area',
  defaultMetric = 'rates',
  className
}) => {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [metricType, setMetricType] = useState<MetricType>(defaultMetric);

  const formatTooltipValue = (value: any, name: string) => {
    if (name.includes('rate') || name.includes('Rate')) {
      return [`${value}%`, name];
    }
    return [value?.toLocaleString(), name];
  };

  const formatXAxisTick = (tickItem: any) => {
    return format(new Date(tickItem), 'MMM d');
  };

  const formatYAxisTick = (tickItem: any) => {
    if (metricType === 'rates') {
      return `${tickItem}%`;
    }
    return tickItem.toLocaleString();
  };

  const getYAxisDomain = () => {
    if (metricType === 'rates') {
      return [0, 100];
    }
    return ['dataMin', 'dataMax'];
  };

  const renderChart = () => {
    const commonProps = {
      data,
      height,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const chartComponents = {
      line: LineChart,
      area: AreaChart,
      bar: BarChart
    };

    const ChartComponent = chartComponents[chartType];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisTick}
            className="text-xs fill-muted-foreground"
          />
          <YAxis 
            tickFormatter={formatYAxisTick}
            domain={getYAxisDomain()}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip 
            labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />

          {metricType === 'volume' && (
            <>
              {chartType === 'area' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="emails_sent"
                    stackId="1"
                    stroke={COLORS.sent}
                    fill={COLORS.sent}
                    fillOpacity={0.6}
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="emails_delivered"
                    stackId="2"
                    stroke={COLORS.delivered}
                    fill={COLORS.delivered}
                    fillOpacity={0.6}
                    name="Delivered"
                  />
                  <Area
                    type="monotone"
                    dataKey="emails_opened"
                    stackId="3"
                    stroke={COLORS.opened}
                    fill={COLORS.opened}
                    fillOpacity={0.6}
                    name="Opened"
                  />
                  <Area
                    type="monotone"
                    dataKey="emails_clicked"
                    stackId="4"
                    stroke={COLORS.clicked}
                    fill={COLORS.clicked}
                    fillOpacity={0.6}
                    name="Clicked"
                  />
                </>
              ) : chartType === 'line' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="emails_sent"
                    stroke={COLORS.sent}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Sent"
                  />
                  <Line
                    type="monotone"
                    dataKey="emails_delivered"
                    stroke={COLORS.delivered}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Delivered"
                  />
                  <Line
                    type="monotone"
                    dataKey="emails_opened"
                    stroke={COLORS.opened}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Opened"
                  />
                  <Line
                    type="monotone"
                    dataKey="emails_clicked"
                    stroke={COLORS.clicked}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Clicked"
                  />
                </>
              ) : (
                <>
                  <Bar dataKey="emails_sent" fill={COLORS.sent} name="Sent" />
                  <Bar dataKey="emails_delivered" fill={COLORS.delivered} name="Delivered" />
                  <Bar dataKey="emails_opened" fill={COLORS.opened} name="Opened" />
                  <Bar dataKey="emails_clicked" fill={COLORS.clicked} name="Clicked" />
                </>
              )}
            </>
          )}

          {metricType === 'rates' && (
            <>
              {chartType === 'area' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="open_rate"
                    stroke={COLORS.openRate}
                    fill={COLORS.openRate}
                    fillOpacity={0.3}
                    name="Open Rate"
                  />
                  <Area
                    type="monotone"
                    dataKey="click_rate"
                    stroke={COLORS.clickRate}
                    fill={COLORS.clickRate}
                    fillOpacity={0.3}
                    name="Click Rate"
                  />
                  {data[0]?.bounce_rate !== undefined && (
                    <Area
                      type="monotone"
                      dataKey="bounce_rate"
                      stroke={COLORS.bounceRate}
                      fill={COLORS.bounceRate}
                      fillOpacity={0.3}
                      name="Bounce Rate"
                    />
                  )}
                </>
              ) : chartType === 'line' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="open_rate"
                    stroke={COLORS.openRate}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Open Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="click_rate"
                    stroke={COLORS.clickRate}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Click Rate"
                  />
                  {data[0]?.bounce_rate !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="bounce_rate"
                      stroke={COLORS.bounceRate}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      name="Bounce Rate"
                    />
                  )}
                </>
              ) : (
                <>
                  <Bar dataKey="open_rate" fill={COLORS.openRate} name="Open Rate" />
                  <Bar dataKey="click_rate" fill={COLORS.clickRate} name="Click Rate" />
                  {data[0]?.bounce_rate !== undefined && (
                    <Bar dataKey="bounce_rate" fill={COLORS.bounceRate} name="Bounce Rate" />
                  )}
                </>
              )}
              
              {/* Reference lines for industry benchmarks */}
              <ReferenceLine y={20} stroke="#10b981" strokeDasharray="3 3" label="Industry Avg Open Rate" />
              <ReferenceLine y={3} stroke="#3b82f6" strokeDasharray="3 3" label="Industry Avg Click Rate" />
            </>
          )}

          {metricType === 'engagement' && (
            <>
              {chartType === 'area' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="click_to_open_rate"
                    stroke={COLORS.clickRate}
                    fill={COLORS.clickRate}
                    fillOpacity={0.4}
                    name="Click-to-Open Rate"
                  />
                  {data[0]?.unsubscribe_rate !== undefined && (
                    <Area
                      type="monotone"
                      dataKey="unsubscribe_rate"
                      stroke={COLORS.unsubscribed}
                      fill={COLORS.unsubscribed}
                      fillOpacity={0.4}
                      name="Unsubscribe Rate"
                    />
                  )}
                </>
              ) : chartType === 'line' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="click_to_open_rate"
                    stroke={COLORS.clickRate}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Click-to-Open Rate"
                  />
                  {data[0]?.unsubscribe_rate !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="unsubscribe_rate"
                      stroke={COLORS.unsubscribed}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Unsubscribe Rate"
                    />
                  )}
                </>
              ) : (
                <>
                  <Bar dataKey="click_to_open_rate" fill={COLORS.clickRate} name="Click-to-Open Rate" />
                  {data[0]?.unsubscribe_rate !== undefined && (
                    <Bar dataKey="unsubscribe_rate" fill={COLORS.unsubscribed} name="Unsubscribe Rate" />
                  )}
                </>
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const ChartTypeIcon = chartType === 'line' ? LineChartIcon : 
                      chartType === 'area' ? Activity : BarChart3;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Select value={metricType} onValueChange={(value: MetricType) => setMetricType(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Email Volume</SelectItem>
                  <SelectItem value="rates">Success Rates</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex rounded-md border border-input bg-background">
                {['line', 'area', 'bar'].map((type) => {
                  const Icon = type === 'line' ? LineChartIcon : 
                            type === 'area' ? Activity : BarChart3;
                  return (
                    <Button
                      key={type}
                      variant={chartType === type ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setChartType(type as ChartType)}
                      className="rounded-none first:rounded-l-md last:rounded-r-md border-0"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <motion.div
          key={`${chartType}-${metricType}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {data && data.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              <div className="text-center">
                <ChartTypeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No email performance data available</p>
              </div>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default EmailPerformanceChart;