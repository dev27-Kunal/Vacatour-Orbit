import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendIndicator } from './TrendIndicator';

export interface FunnelStage {
  name: string;
  value: number;
  previousValue?: number;
  color?: string;
  description?: string;
  trend?: number;
  icon?: React.ReactNode;
}

export interface ConversionFunnelProps {
  stages: FunnelStage[];
  title?: string;
  description?: string;
  showPercentages?: boolean;
  showTrends?: boolean;
  showLabels?: boolean;
  variant?: 'default' | 'colorful';
  className?: string;
}

const DEFAULT_COLORS = [
  '#6366f1', // Purple
  '#3b82f6', // Blue  
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
];

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  stages,
  title = 'Conversion Funnel',
  description,
  showPercentages = true,
  showTrends = true,
  showLabels = true,
  variant = 'default',
  className
}) => {
  if (!stages || stages.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <ChevronDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No funnel data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate conversions and percentages
  const firstStageValue = stages[0]?.value || 1;
  const stagesWithMetrics = stages.map((stage, index) => {
    const conversionRate = index === 0 ? 100 : (stage.value / firstStageValue) * 100;
    const dropOffFromPrevious = index === 0 ? 0 : 
      ((stages[index - 1].value - stage.value) / stages[index - 1].value) * 100;
    
    return {
      ...stage,
      conversionRate,
      dropOffFromPrevious,
      color: stage.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    };
  });

  // Calculate the maximum width for the first stage (100%)
  const maxWidth = 400;
  
  const getFunnelStageWidth = (conversionRate: number) => {
    return Math.max((conversionRate / 100) * maxWidth, 80); // Minimum width of 80px
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col items-center space-y-1 py-4">
          {stagesWithMetrics.map((stage, index) => {
            const stageWidth = getFunnelStageWidth(stage.conversionRate);
            const isLast = index === stagesWithMetrics.length - 1;
            
            return (
              <React.Fragment key={index}>
                {/* Funnel Stage */}
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Stage Box */}
                  <div
                    className={cn(
                      'relative flex items-center justify-center rounded-lg py-6 px-4 transition-all duration-300 hover:scale-105 hover:shadow-lg',
                      variant === 'colorful' 
                        ? 'text-white font-medium shadow-md' 
                        : 'border-2 bg-background hover:bg-muted'
                    )}
                    style={{
                      width: `${stageWidth}px`,
                      backgroundColor: variant === 'colorful' ? stage.color : undefined,
                      borderColor: variant === 'default' ? stage.color : undefined,
                    }}
                  >
                    <div className="text-center">
                      {/* Icon */}
                      {stage.icon && (
                        <div className="flex justify-center mb-2">
                          {stage.icon}
                        </div>
                      )}
                      
                      {/* Stage Name */}
                      {showLabels && (
                        <div className={cn(
                          'font-semibold mb-1',
                          variant === 'colorful' ? 'text-white' : 'text-foreground'
                        )}>
                          {stage.name}
                        </div>
                      )}
                      
                      {/* Value */}
                      <div className={cn(
                        'text-2xl font-bold',
                        variant === 'colorful' ? 'text-white' : 'text-foreground'
                      )}>
                        {stage.value.toLocaleString()}
                      </div>
                      
                      {/* Percentage */}
                      {showPercentages && index > 0 && (
                        <div className={cn(
                          'text-sm',
                          variant === 'colorful' ? 'text-white/80' : 'text-muted-foreground'
                        )}>
                          {stage.conversionRate.toFixed(1)}% of total
                        </div>
                      )}
                      
                      {/* Description */}
                      {stage.description && (
                        <div className={cn(
                          'text-xs mt-1',
                          variant === 'colorful' ? 'text-white/70' : 'text-muted-foreground'
                        )}>
                          {stage.description}
                        </div>
                      )}
                    </div>
                    
                    {/* Trend Indicator */}
                    {showTrends && stage.trend !== undefined && (
                      <div className="absolute -top-2 -right-2">
                        <TrendIndicator
                          value={stage.trend}
                          size="sm"
                          className={variant === 'colorful' ? 'text-white' : undefined}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Drop-off tooltip */}
                  {index > 0 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-popover border rounded px-2 py-1 text-xs text-popover-foreground shadow-md whitespace-nowrap">
                        {stage.dropOffFromPrevious.toFixed(1)}% drop from previous
                      </div>
                    </div>
                  )}
                </motion.div>
                
                {/* Connector Arrow */}
                {!isLast && (
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: (index * 0.1) + 0.3 }}
                  >
                    <ChevronDown 
                      className="text-muted-foreground h-6 w-6" 
                      style={{ color: stage.color }}
                    />
                    {/* Drop-off percentage */}
                    <div className="text-xs text-muted-foreground mt-1">
                      -{stage.dropOffFromPrevious.toFixed(1)}%
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {((stagesWithMetrics[stagesWithMetrics.length - 1]?.value / firstStageValue) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Overall Conversion</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {stagesWithMetrics.length}
            </div>
            <div className="text-sm text-muted-foreground">Stages</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {(stagesWithMetrics.reduce((acc, stage, index) => 
                acc + (index > 0 ? stage.dropOffFromPrevious : 0), 0) / (stagesWithMetrics.length - 1)).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Drop-off</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Preset funnel configurations
export const FunnelPresets = {
  emailCampaign: (data: { sent: number; delivered: number; opened: number; clicked: number; converted: number }) => (
    <ConversionFunnel
      title="Email Campaign Funnel"
      description="User journey from email send to conversion"
      stages={[
        { name: 'Emails Sent', value: data.sent, description: 'Total emails dispatched' },
        { name: 'Delivered', value: data.delivered, description: 'Successfully delivered' },
        { name: 'Opened', value: data.opened, description: 'Recipients who opened' },
        { name: 'Clicked', value: data.clicked, description: 'Users who clicked links' },
        { name: 'Converted', value: data.converted, description: 'Completed desired action' }
      ]}
      variant="colorful"
    />
  ),
  
  jobApplication: (data: { viewed: number; interested: number; applied: number; interviewed: number; hired: number }) => (
    <ConversionFunnel
      title="Job Application Funnel"
      description="Candidate journey from viewing to hiring"
      stages={[
        { name: 'Job Viewed', value: data.viewed, description: 'Job postings viewed' },
        { name: 'Showed Interest', value: data.interested, description: 'Expressed interest' },
        { name: 'Applied', value: data.applied, description: 'Submitted application' },
        { name: 'Interviewed', value: data.interviewed, description: 'Reached interview stage' },
        { name: 'Hired', value: data.hired, description: 'Successfully hired' }
      ]}
      variant="default"
    />
  )
};

export default ConversionFunnel;