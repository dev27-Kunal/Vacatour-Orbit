import React, { useState, useEffect } from 'react';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { apiGet } from '@/lib/api-client';

interface UnreadCount {
  count: number;
}

export default function NotificationBell() {
  const [, setLocation] = useLocation();
  const { isSubscribed, showLocalNotification } = usePushNotifications();

  // Get unread message count
  const { data: unreadData } = useQuery<{ unreadCount: number }>({
    queryKey: ['/api/v2/messages/unread-count'],
    queryFn: async () => {
      const response = await apiGet<{ unreadCount: number }>('/api/v2/messages/unread-count');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch unread count');
      }
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadData?.unreadCount || 0;

  const handleNavigateToMessages = () => {
    setLocation('/messages');
  };

  const handleNavigateToSettings = () => {
    setLocation('/settings?tab=notifications');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 text-xs flex items-center justify-center rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <h3 className="font-semibold text-sm">Notificaties</h3>
          <p className="text-xs text-gray-500">
            {unreadCount === 0 
              ? 'Geen nieuwe berichten' 
              : `${unreadCount} nieuwe bericht${unreadCount === 1 ? '' : 'en'}`
            }
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleNavigateToMessages}>
          <Bell className="mr-2 h-4 w-4" />
          <span>Bekijk berichten</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {unreadCount}
            </Badge>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleNavigateToSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Notificatie-instellingen</span>
          {!isSubscribed && (
            <Badge variant="outline" className="ml-auto text-xs">
              Uit
            </Badge>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}