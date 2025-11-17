import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquare, Send, Inbox, Archive, Search, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  companyName: string;
  jobTitle: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
}

export default function BureauMessagesPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch messages
  const { data: messages = [], isLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ['bureau-messages'],
    queryFn: async () => {
      const response = await fetch('/api/bureau/messages', {
        credentials: 'include',
      });
      if (!response.ok) {throw new Error('Failed to fetch messages');}
      return response.json();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/bureau/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {throw new Error('Failed to mark message as read');}
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bureau-messages'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to mark as read',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: async ({ messageId, reply }: { messageId: string; reply: string }) => {
      const response = await fetch(`/api/bureau/messages/${messageId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: reply }),
      });
      if (!response.ok) {throw new Error('Failed to send reply');}
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reply sent',
        description: 'Your message has been sent successfully.',
      });
      setReplyText('');
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ['bureau-messages'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send reply',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) {return;}
    sendReplyMutation.mutate({
      messageId: selectedMessage.id,
      reply: replyText,
    });
  };

  const filteredMessages = messages.filter((msg) =>
    searchQuery === '' ||
    msg.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadMessages = filteredMessages.filter((msg) => !msg.read && !msg.archived);
  const archivedMessages = filteredMessages.filter((msg) => msg.archived);

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading messages</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message || 'Failed to load messages. Please try again.'}</span>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('navigation.bureauMessages')}</h1>
        <p className="text-muted-foreground">{t('bureauPortal.messages.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  {t('bureauPortal.messages.inboxTitle')}
                </span>
                <Badge variant="secondary">{unreadMessages.length} {t('bureauPortal.messages.unread')}</Badge>
              </CardTitle>
              <CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('bureauPortal.messages.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inbox" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inbox">{t('bureauPortal.messages.inboxTab', { count: unreadMessages.length })}</TabsTrigger>
                  <TabsTrigger value="archived">{t('bureauPortal.messages.archivedTab', { count: archivedMessages.length })}</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="space-y-2 mt-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : unreadMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('bureauPortal.messages.allCaughtUp')}</h3>
                      <p className="text-sm text-muted-foreground">{t('bureauPortal.messages.noUnread')}</p>
                    </div>
                  ) : (
                    unreadMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-accent' : ''
                        } ${!message.read ? 'border-primary' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-sm">{message.companyName}</p>
                          {!message.read && (
                            <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{message.jobTitle}</p>
                        <p className="text-sm font-medium mb-1">{message.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {message.preview}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="archived" className="space-y-2 mt-4">
                  {archivedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No archived messages</h3>
                      <p className="text-sm text-muted-foreground">
                        Messages you archive will appear here
                      </p>
                    </div>
                  ) : (
                    archivedMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-sm">{message.companyName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{message.jobTitle}</p>
                        <p className="text-sm font-medium mb-1">{message.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail & Reply */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <CardDescription>
                      From {selectedMessage.companyName} • {selectedMessage.jobTitle}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Message Content */}
                  <div className="prose max-w-none">
                    <p className="text-sm text-muted-foreground mb-4">
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                      <p>{selectedMessage.preview}</p>
                      {/* In a real implementation, load full message content here */}
                    </div>
                  </div>

                  {/* Reply Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Reply
                    </h3>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={6}
                      className="mb-4"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedMessage(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendReplyMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No message selected</p>
                <p className="text-sm text-muted-foreground">
                  Select a message from the list to view and reply
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
