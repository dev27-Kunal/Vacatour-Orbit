import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendIndicator } from './TrendIndicator';
import { RealtimeCounter } from './RealtimeCounter';

export interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  trend?: number;
  trendFormat?: 'percentage' | 'number' | 'currency';
  format?: (value: number) => string;
  icon?: LucideIcon;
  description?: string;
  loading?: boolean;
  error?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  realtime?: boolean;
  className?: string;
}

const defaultFormat = (value: number) => value.toLocaleString();

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  trend,
  trendFormat = 'percentage',
  format = defaultFormat,
  icon: Icon,
  description,
  loading = false,
  error,
  variant = 'default',
  size = 'md',
  realtime = false,
  className
}) => {
  const variants = {
    default: 'border-gray-200 dark:border-gray-800',
    success: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/50',
    danger: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/50'
  };

  const iconColors = {
    default: 'text-gray-500 dark:text-gray-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400'
  };

  const sizes = {
    sm: {
      card: 'p-4',
      title: 'text-sm',
      value: 'text-xl',
      icon: 16,
      description: 'text-xs'
    },
    md: {
      card: 'p-6',
      title: 'text-sm',
      value: 'text-2xl',
      icon: 18,
      description: 'text-xs'
    },
    lg: {
      card: 'p-8',
      title: 'text-base',
      value: 'text-3xl',
      icon: 20,
      description: 'text-sm'
    }
  };

  if (loading) {
    return (
      <Card className={cn(variants[variant], className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={sizes[size].title}>{title}</CardTitle>
          {Icon && (
            <div className="animate-pulse">
              <div className={`w-${sizes[size].icon/4} h-${sizes[size].icon/4} bg-gray-300 dark:bg-gray-600 rounded`} />
            </div>
          )}
        </CardHeader>
        <CardContent className={sizes[size].card.replace('p-', 'pt-0 px-')}>
          <div className="space-y-2">
            <div className={`h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${sizes[size].value}`} />
            {description && (
              <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${sizes[size].description}`} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('border-red-200 dark:border-red-800', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={sizes[size].title}>{title}</CardTitle>
          {Icon && <Icon size={sizes[size].icon} className="text-red-500" />}
        </CardHeader>
        <CardContent className={sizes[size].card.replace('p-', 'pt-0 px-')}>
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(variants[variant], 'transition-all hover:shadow-md', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn('font-medium', sizes[size].title)}>
            {title}
          </CardTitle>
          {Icon && (
            <Icon size={sizes[size].icon} className={cn(iconColors[variant])} />
          )}
        </CardHeader>
        <CardContent className={sizes[size].card.replace('p-', 'pt-0 px-')}>
          <div className="space-y-1">
            {realtime ? (
              <RealtimeCounter
                value={value}
                previousValue={previousValue}
                format={format}
                className={sizes[size].value}
                size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'}
              />
            ) : (
              <div className={cn('font-bold', sizes[size].value)}>
                {format(value)}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {description && (
                <p className={cn('text-muted-foreground', sizes[size].description)}>
                  {description}
                </p>
              )}
              
              {trend !== undefined && (
                <TrendIndicator
                  value={trend}
                  format={trendFormat}
                  size={size === 'lg' ? 'md' : 'sm'}
                  className="ml-auto"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Preset metric card configurations
export const MetricCardPresets = {
  currency: (props: Omit<MetricCardProps, 'format' | 'trendFormat'>) => (
    <MetricCard
      {...props}
      format={(value) => `€${value.toLocaleString()}`}
      trendFormat="currency"
    />
  ),
  
  percentage: (props: Omit<MetricCardProps, 'format' | 'trendFormat'>) => (
    <MetricCard
      {...props}
      format={(value) => `${value.toFixed(1)}%`}
      trendFormat="percentage"
    />
  ),
  
  count: (props: Omit<MetricCardProps, 'format' | 'trendFormat'>) => (
    <MetricCard
      {...props}
      format={(value) => value.toLocaleString()}
      trendFormat="number"
    />
  ),
  
  time: (props: Omit<MetricCardProps, 'format' | 'trendFormat'>) => (
    <MetricCard
      {...props}
      format={(value) => `${value.toFixed(0)}ms`}
      trendFormat="number"
    />
  )
};

export default MetricCard;