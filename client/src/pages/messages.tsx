import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useApp } from "@/providers/AppProvider";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Clock, Users, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useLanguageContext } from "@/context/LanguageContext";
import { GroupChatCreate } from "@/components/GroupChatCreate";
import { PageWrapper } from "@/components/page-wrapper";

interface MessageThread {
  id: string;
  jobId?: string;
  applicationId?: string;
  companyUserId?: string;
  applicantUserId?: string;
  unreadByCompany: number;
  unreadByApplicant: number;
  lastMessageAt: string | null;
  createdAt: string;
  // Group chat fields
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  // Regular chat fields
  job?: { title: string };
  companyUser?: { name: string; companyName: string | null };
  applicantUser?: { name: string };
  lastMessage?: { content: string; createdAt: string };
  // Group participants count
  participantCount?: number;
}

export default function Messages() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageContext();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { user: currentUser } = useApp();

  const { data: threads = [], isLoading } = useQuery<MessageThread[]>({
    queryKey: ["/api/v2/messages/threads"],
    queryFn: async () => {
      const response = await apiGet<MessageThread[]>("/api/v2/messages/threads");
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch threads");
      }
      return response.data;
    },
  });

  // Filter threads based on search and filter options
  const filteredThreads = threads.filter((thread) => {
    let matchesSearch = false;
    
    if (thread.isGroup) {
      // Search in group name and description
      matchesSearch = 
        (!!thread.groupName && thread.groupName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (!!thread.groupDescription && thread.groupDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
      // Search in regular thread fields
      matchesSearch = 
        (!!thread.job?.title && thread.job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (!!thread.companyUser?.name && thread.companyUser.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (!!thread.applicantUser?.name && thread.applicantUser.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filter === "unread") {
      const hasUnread = currentUser?.id === thread.companyUserId 
        ? thread.unreadByCompany > 0
        : thread.unreadByApplicant > 0;
      return matchesSearch && hasUnread;
    }

    return matchesSearch;
  });

  const getUnreadCount = (thread: MessageThread) => {
    if (thread.isGroup) {
      // For group chats, we'll need to implement per-user unread counts
      // For now, use a simple fallback
      return thread.unreadByCompany; // This should be updated to use participant-specific counts
    }
    return currentUser?.id === thread.companyUserId 
      ? thread.unreadByCompany 
      : thread.unreadByApplicant;
  };

  const getOtherPartyName = (thread: MessageThread) => {
    if (thread.isGroup) {
      return thread.groupName || 'Group Chat';
    }
    return currentUser?.id === thread.companyUserId 
      ? thread.applicantUser?.name || 'Unknown'
      : thread.companyUser?.name || 'Unknown';
  };

  const getCompanyName = (thread: MessageThread) => {
    if (thread.isGroup) {
      return thread.participantCount ? `${thread.participantCount} members` : 'Group';
    }
    return thread.companyUser?.companyName || thread.companyUser?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 700 rounded w-1/4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-foreground ">
                {t('messages.title')}
              </h1>
            </div>
            <GroupChatCreate>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Group Chat
              </Button>
            </GroupChatCreate>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('messages.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-messages"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48" data-testid="select-message-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('messages.allMessages')}</SelectItem>
                <SelectItem value="unread">{t('messages.unread')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="feature-card bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground 400">
                      {t('messages.activeConversations')}
                    </p>
                    <p className="text-2xl font-bold text-foreground ">
                      {threads.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="feature-card bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Badge className="h-5 w-5 bg-red-100 text-red-800" />
                  <div>
                    <p className="text-sm text-muted-foreground 400">
                      {t('messages.unread')}
                    </p>
                    <p className="text-2xl font-bold text-foreground ">
                      {threads.filter(thread => getUnreadCount(thread) > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="feature-card bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground 400">
                      {t('messages.activeToday')}
                    </p>
                    <p className="text-2xl font-bold text-foreground ">
                      {threads.filter(thread => 
                        thread.lastMessageAt && 
                        new Date(thread.lastMessageAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                      ).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredThreads.length === 0 ? (
            <Card className="feature-card bg-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {threads.length === 0 ? t('messages.noConversations') : t('messages.noResults')}
                </h3>
                <p className="text-muted-foreground 400 mb-4">
                  {threads.length === 0 
                    ? t('messages.noConversationsMessage')
                    : t('messages.noResultsMessage')
                  }
                </p>
                {threads.length === 0 && (
                  <Button 
                    onClick={() => setLocation("/jobs")}
                    data-testid="button-browse-jobs"
                  >
                    {t('messages.browseJobs')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredThreads.map((thread) => {
              const unreadCount = getUnreadCount(thread);
              const isUnread = unreadCount > 0;
              
              return (
                <Card 
                  key={thread.id} 
                  className={`feature-card bg-card cursor-pointer transition-colors hover:bg-background ${
                    isUnread ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                  onClick={() => setLocation(`/messages/${thread.id}`)}
                  data-testid={`card-thread-${thread.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg font-semibold ${isUnread ? 'text-foreground ' : 'text-gray-700 300'}`}>
                            {thread.isGroup 
                              ? (thread.groupName || 'Group Chat')
                              : (thread.job?.title || 'Chat')
                            }
                          </h3>
                          {thread.isGroup && (
                            <Badge variant="secondary" className="text-xs">
                              Group
                            </Badge>
                          )}
                          {isUnread && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground 400">
                          <span>{t('messages.with')}: {getOtherPartyName(thread)}</span>
                          <span>•</span>
                          <span>{getCompanyName(thread)}</span>
                        </div>

                        {thread.lastMessage && (
                          <p className={`text-sm line-clamp-2 ${
                            isUnread ? 'text-gray-700 300' : 'text-gray-500 400'
                          }`}>
                            {thread.lastMessage.content}
                          </p>
                        )}
                      </div>

                      <div className="text-right text-sm text-gray-500 400">
                        {thread.lastMessageAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(thread.lastMessageAt), {
                                addSuffix: true,
                                locale: currentLanguage === 'en' ? enUS : nl,
                              })}
                            </span>
                          </div>
                        ) : (
                          <span>{t('messages.newConversation')}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        </div>
      </div>
    </PageWrapper>
  );
}