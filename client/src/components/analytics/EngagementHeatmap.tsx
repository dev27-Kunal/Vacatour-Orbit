import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, startOfWeek, addDays, getHours, startOfDay, addHours } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeatmapDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface EngagementHeatmapProps {
  data: HeatmapDataPoint[];
  title?: string;
  description?: string;
  type?: 'daily' | 'hourly' | 'weekly';
  metric?: string;
  valueFormat?: (value: number) => string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  showControls?: boolean;
  className?: string;
}

type HeatmapType = 'daily' | 'hourly' | 'weekly';
type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red';

const COLOR_SCHEMES = {
  blue: {
    low: 'bg-blue-100 dark:bg-blue-900/20',
    medium: 'bg-blue-300 dark:bg-blue-700/40',
    high: 'bg-blue-500 dark:bg-blue-600/60',
    veryHigh: 'bg-blue-700 dark:bg-blue-500/80',
    text: 'text-blue-900 dark:text-blue-100'
  },
  green: {
    low: 'bg-green-100 dark:bg-green-900/20',
    medium: 'bg-green-300 dark:bg-green-700/40',
    high: 'bg-green-500 dark:bg-green-600/60',
    veryHigh: 'bg-green-700 dark:bg-green-500/80',
    text: 'text-green-900 dark:text-green-100'
  },
  purple: {
    low: 'bg-purple-100 dark:bg-purple-900/20',
    medium: 'bg-purple-300 dark:bg-purple-700/40',
    high: 'bg-purple-500 dark:bg-purple-600/60',
    veryHigh: 'bg-purple-700 dark:bg-purple-500/80',
    text: 'text-purple-900 dark:text-purple-100'
  },
  orange: {
    low: 'bg-orange-100 dark:bg-orange-900/20',
    medium: 'bg-orange-300 dark:bg-orange-700/40',
    high: 'bg-orange-500 dark:bg-orange-600/60',
    veryHigh: 'bg-orange-700 dark:bg-orange-500/80',
    text: 'text-orange-900 dark:text-orange-100'
  },
  red: {
    low: 'bg-red-100 dark:bg-red-900/20',
    medium: 'bg-red-300 dark:bg-red-700/40',
    high: 'bg-red-500 dark:bg-red-600/60',
    veryHigh: 'bg-red-700 dark:bg-red-500/80',
    text: 'text-red-900 dark:text-red-100'
  }
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({
  data,
  title = 'User Engagement Heatmap',
  description,
  type: initialType = 'hourly',
  metric = 'Activity',
  valueFormat = (value) => value.toString(),
  colorScheme: initialColorScheme = 'blue',
  showControls = true,
  className
}) => {
  const [heatmapType, setHeatmapType] = useState<HeatmapType>(initialType);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(initialColorScheme);

  // Process data based on type
  const processData = () => {
    if (!data || data.length === 0) {return [];}

    const processed = new Map<string, number>();
    
    data.forEach(point => {
      const date = new Date(point.timestamp);
      let key: string;

      switch (heatmapType) {
        case 'daily':
          key = format(date, 'yyyy-MM-dd');
          break;
        case 'hourly':
          key = `${format(date, 'EEE')}-${getHours(date)}`;
          break;
        case 'weekly':
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          key = format(weekStart, 'yyyy-MM-dd');
          break;
        default:
          key = point.timestamp;
      }

      processed.set(key, (processed.get(key) || 0) + point.value);
    });

    return Array.from(processed.entries()).map(([key, value]) => ({ key, value }));
  };

  const processedData = processData();
  const maxValue = Math.max(...processedData.map(d => d.value), 1);

  const getIntensityClass = (value: number) => {
    const intensity = value / maxValue;
    const colors = COLOR_SCHEMES[colorScheme];
    
    if (intensity === 0) {return 'bg-muted';}
    if (intensity <= 0.25) {return colors.low;}
    if (intensity <= 0.5) {return colors.medium;}
    if (intensity <= 0.75) {return colors.high;}
    return colors.veryHigh;
  };

  const renderDailyHeatmap = () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = addDays(new Date(), -29 + i);
      const key = format(date, 'yyyy-MM-dd');
      const dataPoint = processedData.find(d => d.key === key);
      return { date, key, value: dataPoint?.value || 0 };
    });

    return (
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map(({ date, key, value }) => (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className={cn(
                    'aspect-square rounded-sm cursor-pointer transition-all hover:scale-110 hover:shadow-md',
                    getIntensityClass(value)
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: Math.random() * 0.5 }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">{format(date, 'MMM d, yyyy')}</div>
                  <div className="text-sm">{valueFormat(value)} {metric.toLowerCase()}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  const renderHourlyHeatmap = () => {
    return (
      <div className="space-y-2">
        {/* Hour labels */}
        <div className="grid grid-cols-25 gap-1 text-xs text-muted-foreground">
          <div></div> {/* Empty cell for day labels */}
          {HOURS.map(hour => (
            <div key={hour} className="text-center">
              {hour % 4 === 0 ? hour : ''}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        {WEEKDAYS.map(day => (
          <div key={day} className="grid grid-cols-25 gap-1 items-center">
            <div className="text-xs font-medium text-muted-foreground w-8">
              {day}
            </div>
            {HOURS.map(hour => {
              const key = `${day}-${hour}`;
              const dataPoint = processedData.find(d => d.key === key);
              const value = dataPoint?.value || 0;
              
              return (
                <TooltipProvider key={`${day}-${hour}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={cn(
                          'aspect-square rounded-sm cursor-pointer transition-all hover:scale-125 hover:shadow-md',
                          getIntensityClass(value)
                        )}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: (WEEKDAYS.indexOf(day) * 24 + hour) * 0.005 
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <div className="font-medium">{day} at {hour}:00</div>
                        <div className="text-sm">{valueFormat(value)} {metric.toLowerCase()}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderWeeklyHeatmap = () => {
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const weekStart = startOfWeek(addDays(new Date(), -84 + (i * 7)), { weekStartsOn: 1 });
      const key = format(weekStart, 'yyyy-MM-dd');
      const dataPoint = processedData.find(d => d.key === key);
      return { 
        weekStart, 
        key, 
        value: dataPoint?.value || 0,
        label: format(weekStart, 'MMM d')
      };
    });

    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {weeks.map(({ weekStart, key, value, label }) => (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className={cn(
                    'aspect-square rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center',
                    getIntensityClass(value)
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.random() * 0.8 }}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-xs">{valueFormat(value)}</div>
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">Week of {format(weekStart, 'MMM d, yyyy')}</div>
                  <div className="text-sm">{valueFormat(value)} {metric.toLowerCase()}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  const renderHeatmap = () => {
    switch (heatmapType) {
      case 'daily':
        return renderDailyHeatmap();
      case 'hourly':
        return renderHourlyHeatmap();
      case 'weekly':
        return renderWeeklyHeatmap();
      default:
        return null;
    }
  };

  const renderLegend = () => {
    const colors = COLOR_SCHEMES[colorScheme];
    const intensities = [
      { label: 'Low', class: colors.low },
      { label: 'Medium', class: colors.medium },
      { label: 'High', class: colors.high },
      { label: 'Very High', class: colors.veryHigh }
    ];

    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted"></div>
          {intensities.map(({ label, class: colorClass }) => (
            <div key={label} className={cn('w-3 h-3 rounded-sm', colorClass)}></div>
          ))}
        </div>
        <span>More</span>
      </div>
    );
  };

  const getTypeIcon = () => {
    switch (heatmapType) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'hourly': return <Clock className="h-4 w-4" />;
      case 'weekly': return <Activity className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <CardTitle>{title}</CardTitle>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Select value={heatmapType} onValueChange={(value: HeatmapType) => setHeatmapType(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={colorScheme} onValueChange={(value: ColorScheme) => setColorScheme(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <motion.div
            key={`${heatmapType}-${colorScheme}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {data && data.length > 0 ? (
              renderHeatmap()
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No engagement data available</p>
                </div>
              </div>
            )}
          </motion.div>
          
          {data && data.length > 0 && (
            <div className="flex justify-between items-center">
              {renderLegend()}
              <div className="text-xs text-muted-foreground">
                Max: {valueFormat(maxValue)} {metric.toLowerCase()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementHeatmap;