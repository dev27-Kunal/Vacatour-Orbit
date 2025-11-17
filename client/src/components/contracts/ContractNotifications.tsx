/**
 * Contract Notifications Component
 * Shows contract-related notifications and alerts
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileSignature,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Calendar,
  TrendingUp,
  User,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { format, differenceInDays, addDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ContractNotification {
  id: string;
  type: 'signature_required' | 'expiring_soon' | 'new_contract' | 'contract_signed' | 'contract_activated' | 'approval_required';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  contractId?: string;
  contractNumber?: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    daysRemaining?: number;
    signerName?: string;
    expiryDate?: string;
  };
}

interface ContractNotificationsProps {
  userId: string;
  userType: string;
  compact?: boolean;
}

export function ContractNotifications({
  userId,
  userType,
  compact = false,
}: ContractNotificationsProps) {
  const [notifications, setNotifications] = useState<ContractNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      // const response = await fetch('/api/v2/contracts/notifications');

      // Mock data for demonstration
      const mockNotifications: ContractNotification[] = [
        {
          id: '1',
          type: 'signature_required',
          priority: 'high',
          title: 'Handtekening Vereist',
          message: 'Contract 202501V00042 wacht op uw handtekening',
          contractId: 'contract-1',
          contractNumber: '202501V00042',
          createdAt: new Date().toISOString(),
          read: false,
          actionUrl: '/contracts/contract-1/sign',
          actionLabel: 'Ondertekenen',
          metadata: {
            daysRemaining: 2,
          },
        },
        {
          id: '2',
          type: 'expiring_soon',
          priority: 'medium',
          title: 'Contract Verloopt Binnenkort',
          message: 'Contract met John Doe verloopt over 7 dagen',
          contractId: 'contract-2',
          contractNumber: '202501I00038',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: false,
          actionUrl: '/contracts/contract-2',
          actionLabel: 'Bekijken',
          metadata: {
            daysRemaining: 7,
            expiryDate: addDays(new Date(), 7).toISOString(),
          },
        },
        {
          id: '3',
          type: 'contract_signed',
          priority: 'low',
          title: 'Contract Ondertekend',
          message: 'Bureau ABC heeft contract 202501V00041 ondertekend',
          contractId: 'contract-3',
          contractNumber: '202501V00041',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          actionUrl: '/contracts/contract-3',
          actionLabel: 'Bekijken',
          metadata: {
            signerName: 'Bureau ABC',
          },
        },
      ];

      // Filter based on user type
      let filtered = mockNotifications;
      if (userType === 'TALENT') {
        filtered = mockNotifications.filter(n =>
          ['signature_required', 'new_contract'].includes(n.type)
        );
      }

      setNotifications(filtered);
      setUnreadCount(filtered.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching contract notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // API call to mark as read
      // await fetch(`/api/v2/contracts/notifications/${notificationId}/read`, {
      //   method: 'POST',
      // });

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAction = async (notification: ContractNotification) => {
    await markAsRead(notification.id);
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: ContractNotification['type']) => {
    switch (type) {
      case 'signature_required':
        return <FileSignature className="h-5 w-5" />;
      case 'expiring_soon':
        return <Clock className="h-5 w-5" />;
      case 'new_contract':
        return <Bell className="h-5 w-5" />;
      case 'contract_signed':
        return <CheckCircle className="h-5 w-5" />;
      case 'contract_activated':
        return <TrendingUp className="h-5 w-5" />;
      case 'approval_required':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (priority: ContractNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: ContractNotification['priority']) => {
    const variants: Record<ContractNotification['priority'], any> = {
      high: 'destructive',
      medium: 'warning',
      low: 'secondary',
    };
    const labels = {
      high: 'Urgent',
      medium: 'Belangrijk',
      low: 'Info',
    };

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {labels[priority]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (compact) {
    // Compact view for dashboard
    const urgentNotifications = notifications
      .filter(n => !n.read && n.priority === 'high')
      .slice(0, 3);

    if (urgentNotifications.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        {urgentNotifications.map((notification) => (
          <Alert key={notification.id} className="border-orange-200 bg-orange-50">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getNotificationColor(notification.priority)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <AlertTitle className="text-sm font-medium">
                  {notification.title}
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {notification.message}
                  {notification.metadata?.daysRemaining && (
                    <span className="font-medium ml-1">
                      ({notification.metadata.daysRemaining} dagen resterend)
                    </span>
                  )}
                </AlertDescription>
                {notification.actionUrl && (
                  <Button
                    size="sm"
                    variant="link"
                    className="h-auto p-0 mt-2 text-xs"
                    onClick={() => handleAction(notification)}
                  >
                    {notification.actionLabel} →
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </div>
    );
  }

  // Full view for notifications page
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contract Notificaties</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} ongelezen {unreadCount === 1 ? 'bericht' : 'berichten'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              notifications.forEach(n => {
                if (!n.read) {markAsRead(n.id);}
              });
            }}
          >
            Markeer alles als gelezen
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.read ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">
                            Nieuw
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {notification.message}
                      </CardDescription>
                    </div>
                  </div>
                  {getPriorityBadge(notification.priority)}
                </div>
              </CardHeader>

              {notification.metadata && (
                <CardContent className="pt-0 pb-3">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {notification.metadata.daysRemaining !== undefined && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{notification.metadata.daysRemaining} dagen resterend</span>
                      </div>
                    )}
                    {notification.metadata.signerName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{notification.metadata.signerName}</span>
                      </div>
                    )}
                    {notification.metadata.expiryDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Verloopt{' '}
                          {format(new Date(notification.metadata.expiryDate), 'dd MMM yyyy', {
                            locale: nl,
                          })}
                        </span>
                      </div>
                    )}
                    {notification.contractNumber && (
                      <div className="flex items-center gap-1">
                        <FileSignature className="h-3 w-3" />
                        <span>{notification.contractNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}

              <CardFooter className="pt-0">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', {
                      locale: nl,
                    })}
                  </span>
                  {notification.actionUrl && (
                    <Button
                      size="sm"
                      variant={notification.priority === 'high' ? 'default' : 'outline'}
                      onClick={() => handleAction(notification)}
                    >
                      {notification.actionLabel}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Geen contract notificaties</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}