/**
 * Bureau Messaging Component
 *
 * Full messaging interface for bureaus:
 * - List of conversations
 * - Message thread view
 * - Send new messages
 * - Mark as read functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPatch, ApiError } from '@/lib/api-client';
import {
  MessageSquare,
  Send,
  User,
  Building,
  Clock,
  Plus,
} from 'lucide-react';

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserType: 'BUREAU' | 'COMPANY';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  fromBureauId: string;
  toBureauId?: string;
  toCompanyId?: string;
  subject: string;
  messageBody: string;
  isRead: boolean;
  createdAt: string;
}

interface BureauMessagingProps {
  bureauId: string;
}

export function BureauMessaging({ bureauId }: BureauMessagingProps) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  // Form states
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationThread(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const data = await apiGet('/api/bureau/conversations');
      setConversations(data.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchConversationThread = async (otherUserId: string) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/bureau/conversations/${otherUserId}`);
      setMessages(data.data || []);

      // Mark unread messages as read
      const unreadMessages = data.data.filter(
        (msg: Message) => !msg.isRead && (msg.toBureauId === bureauId || msg.toCompanyId === bureauId)
      );
      for (const msg of unreadMessages) {
        await markAsRead(msg.id);
      }

      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await apiPatch(`/api/bureau/messages/${messageId}/read`);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedConversation || !replySubject || !replyBody) {
      toast({
        title: 'Validation Error',
        description: 'Subject and message body are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Determine if recipient is bureau or company
      const conversation = conversations.find((c) => c.otherUserId === selectedConversation);
      const recipientField =
        conversation?.otherUserType === 'BUREAU' ? 'toBureauId' : 'toCompanyId';

      await apiPost('/api/bureau/messages', {
        [recipientField]: selectedConversation,
        subject: replySubject,
        messageBody: replyBody,
      });

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      setReplySubject('');
      setReplyBody('');
      fetchConversationThread(selectedConversation);
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to send message';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const selectedConversationData = conversations.find(
    (c) => c.otherUserId === selectedConversation
  );

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-500">
                Start a new conversation from the conversations list or job details page.
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <ScrollArea className="h-full">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <div
                      key={conv.otherUserId}
                      onClick={() => setSelectedConversation(conv.otherUserId)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conv.otherUserId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {conv.otherUserType === 'BUREAU' ? (
                            <User className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Building className="h-4 w-4 text-gray-600" />
                          )}
                          <p className="font-medium text-sm">{conv.otherUserName}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    {selectedConversationData?.otherUserType === 'BUREAU' ? (
                      <User className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Building className="h-5 w-5 text-gray-600" />
                    )}
                    <h3 className="font-semibold">{selectedConversationData?.otherUserName}</h3>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isSent = msg.fromBureauId === bureauId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isSent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="font-medium text-sm mb-1">{msg.subject}</p>
                              <p className="text-sm whitespace-pre-wrap">{msg.messageBody}</p>
                              <p
                                className={`text-xs mt-2 ${
                                  isSent ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Reply Form */}
                <div className="p-4 border-t bg-gray-50">
                  <Input
                    placeholder="Subject"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button onClick={sendReply} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
