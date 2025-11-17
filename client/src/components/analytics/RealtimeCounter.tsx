import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RealtimeCounterProps {
  value: number;
  previousValue?: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const defaultFormat = (value: number) => value.toLocaleString();

export const RealtimeCounter: React.FC<RealtimeCounterProps> = ({
  value,
  previousValue,
  duration = 1000,
  format = defaultFormat,
  className,
  size = 'md'
}) => {
  const [displayValue, setDisplayValue] = useState(previousValue || value);
  const [isAnimating, setIsAnimating] = useState(false);

  const springValue = useSpring(displayValue, {
    damping: 25,
    stiffness: 100,
    duration: duration
  });

  const displayNumber = useTransform(springValue, (latest) => 
    Math.round(latest)
  );

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      springValue.set(value);
      setDisplayValue(value);
      
      // Reset animation state after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [value, displayValue, springValue, duration]);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const pulseAnimation = isAnimating ? {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 }
  } : {};

  return (
    <motion.div
      className={cn(
        'font-bold font-mono tabular-nums',
        sizeClasses[size],
        isAnimating && 'text-blue-600 dark:text-blue-400',
        className
      )}
      animate={pulseAnimation}
    >
      <motion.span>
        {format(useTransform(displayNumber, (latest) => latest).get())}
      </motion.span>
      
      {/* Subtle pulse indicator for live updates */}
      {isAnimating && (
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: 2,
          }}
        />
      )}
    </motion.div>
  );
};

// Hook for managing real-time counter updates
export const useRealtimeCounter = (
  initialValue: number,
  fetchFunction: () => Promise<number>,
  interval = 5000
) => {
  const [value, setValue] = useState(initialValue);
  const [previousValue, setPreviousValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const updateValue = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const newValue = await fetchFunction();
        
        if (newValue !== value) {
          setPreviousValue(value);
          setValue(newValue);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    updateValue();

    // Set up interval
    intervalId = setInterval(updateValue, interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchFunction, interval, value]);

  return {
    value,
    previousValue,
    isLoading,
    error,
    refresh: () => {
      // Trigger immediate update
      setValue(prev => prev); // This will trigger the effect
    }
  };
};

export default RealtimeCounter;