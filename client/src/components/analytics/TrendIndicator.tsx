import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrendIndicatorProps {
  value: number;
  format?: 'percentage' | 'number' | 'currency';
  showIcon?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  format = 'percentage',
  showIcon = true,
  showValue = true,
  size = 'md',
  className
}) => {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'percentage':
        return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
      case 'currency':
        return `${val > 0 ? '+' : ''}€${Math.abs(val).toLocaleString()}`;
      case 'number':
        return `${val > 0 ? '+' : ''}${val.toLocaleString()}`;
      default:
        return val.toString();
    }
  };

  const getTrendColor = (val: number): string => {
    if (val > 0) {return 'text-green-600 dark:text-green-400';}
    if (val < 0) {return 'text-red-600 dark:text-red-400';}
    return 'text-gray-500 dark:text-gray-400';
  };

  const getTrendIcon = (val: number) => {
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
    
    if (val > 0) {return <TrendingUp size={iconSize} />;}
    if (val < 0) {return <TrendingDown size={iconSize} />;}
    return <Minus size={iconSize} />;
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn(
      'flex items-center gap-1 font-medium',
      getTrendColor(value),
      sizeClasses[size],
      className
    )}>
      {showIcon && getTrendIcon(value)}
      {showValue && (
        <span>
          {formatValue(value)}
        </span>
      )}
    </div>
  );
};

export default TrendIndicator;