import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, CheckCheck, MessageSquare, Users, Briefcase, Settings } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import type { Notification } from "@shared/types";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/page-wrapper";
import { apiPatch, apiGet } from "@/lib/api-client";

function NotificationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch notifications - using V2 API
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/v2/notifications"],
    queryFn: async () => {
      const response = await apiGet<Notification[]>("/api/v2/notifications");
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch notifications");
      }
      return response.data;
    },
  });

  // Fetch unread count - using V2 API
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/v2/notifications/unread-count"],
    queryFn: async () => {
      const response = await apiGet<{ count: number }>("/api/v2/notifications/unread-count");
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch unread count");
      }
      return response.data;
    },
  });

  const unreadCount = unreadData?.count || 0;

  // Mark notification as read - using V2 API with POST
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest(`/api/v2/notifications/${notificationId}/read`, {
        method: 'POST',
        body: {},
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark notification as read');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v2/notifications/unread-count"] });
    },
  });

  // Mark all as read - using V2 API with POST and correct endpoint name
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/v2/notifications/read-all', {
        method: 'POST',
        body: {},
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark all notifications as read');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v2/notifications/unread-count"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquare className="h-4 w-4" />;
      case "APPLICATION":
        return <Users className="h-4 w-4" />;
      case "JOB_STATUS":
        return <Briefcase className="h-4 w-4" />;
      case "SYSTEM":
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return "bg-blue-100 text-blue-800";
      case "APPLICATION":
        return "bg-green-100 text-green-800";
      case "JOB_STATUS":
        return "bg-purple-100 text-purple-800";
      case "SYSTEM":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8" data-testid="notifications-page">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-bold text-foreground">{t('notifications.title')}</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" data-testid="unread-count">
                {unreadCount}
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
{t('notifications.markAllRead')}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="feature-card bg-card">
            <CardContent className="py-12">
              <div className="text-center">
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
{t('notifications.noNotifications')}
                </h3>
                <p className="text-muted-foreground">
                  {t('notifications.noNotificationsMessage')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="feature-card bg-card">
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-gray-200">
                {(notifications as Notification[]).map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-background transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: nl,
                            }) : ''}
                          </span>
                          
                          {notification.actionUrl && (
                            <Link href={notification.actionUrl}>
                              <Button variant="ghost" size="sm" data-testid={`button-action-${notification.id}`}>
{t('notifications.view')}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default NotificationsPage;