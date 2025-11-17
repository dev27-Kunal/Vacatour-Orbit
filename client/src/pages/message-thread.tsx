import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, MessageSquare, User, Building2, Clock, Paperclip, Upload, Video } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { nl } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileUpload } from "@/components/FileUpload";
import { FilePreview } from "@/components/FilePreview";
import { VideoCall } from "@/components/VideoCall";
import { PageWrapper } from "@/components/page-wrapper";
import { apiGet, apiPost } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

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
  groupDescription?: string;
  groupAvatar?: string;
  createdBy?: string;
}

interface FileAttachment {
  id: string;
  url: string;
  filename: string;
  filesize: number;
  mimetype: string;
}

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { name: string };
  attachments?: FileAttachment[];
}

interface ThreadData {
  thread: MessageThread;
  messages: Message[];
}

export default function MessageThread() {
  const { threadId } = useParams();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: threadData, isLoading, error } = useQuery<ThreadData>({
    queryKey: [`/api/v2/messages/threads/${threadId}`],
    queryFn: async () => {
      const response = await apiGet<ThreadData>(`/api/v2/messages/threads/${threadId}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch thread");
      }
      return response.data;
    },
    enabled: !!threadId,
    refetchInterval: 10000, // Poll for new messages every 10 seconds
  });

  const { data: currentUser } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiPost(`/api/v2/messages/threads/${threadId}/messages`, { content });

      if (!response.success) {
        throw new Error(response.error || 'Fout bij het versturen van bericht');
      }

      return response.data;
    },
    onSuccess: () => {
      setMessage("");
      setUploadedFiles([]);
      setShowFileUpload(false);
      queryClient.invalidateQueries({ queryKey: [`/api/v2/messages/threads/${threadId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/v2/messages/threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v2/messages/unread-count"] });
    },
    onError: (error: any) => {
      toast({
        title: "Fout bij versturen bericht",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [threadData?.messages]);

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Bestanden geupload",
      description: `${files.length} bestand(en) toegevoegd aan bericht`,
      variant: "default"
    });
  };

  const handleSendMessage = () => {
    if (!message.trim() && uploadedFiles.length === 0) {
      return;
    }
    
    if (message.length > 1000) {
      toast({
        title: "Bericht te lang",
        description: "Bericht mag maximaal 1000 karakters bevatten",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 700 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 700 rounded"></div>
            <div className="h-16 bg-gray-200 700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !threadData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t('messages.thread.notFoundTitle', { defaultValue: 'Conversation not found' })}
          </h1>
          <p className="text-muted-foreground 400 mb-6">
            {t('messages.thread.notFoundDesc', { defaultValue: 'The conversation you are looking for does not exist or you do not have access.' })}
          </p>
          <Button 
            onClick={() => setLocation("/messages")}
            data-testid="button-back-to-messages"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('messages.thread.backToMessages', { defaultValue: 'Back to messages' })}
          </Button>
        </div>
      </div>
    );
  }

  const { thread, messages } = threadData;
  const isUserCompany = currentUser?.user?.id === thread.companyUserId;

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/messages")}
            className="mb-4"
            data-testid="button-back-messages"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('messages.thread.backToMessages', { defaultValue: 'Back to messages' })}
          </Button>

          <Card className="feature-card bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    {thread.isGroup ? thread.groupName || t('messages.thread.groupChat', { defaultValue: 'Group Chat' }) : t('messages.thread.aboutJob', { defaultValue: 'Conversation about job' })}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground 400 mt-1">
                    {thread.isGroup 
                      ? (thread.groupDescription || t('messages.thread.groupConversation', { defaultValue: 'Group conversation' }))
                      : t('messages.thread.betweenParties', { defaultValue: 'Between employer and candidate' })
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVideoCall(true)}
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Video Call
                  </Button>
                  <Badge variant="outline">
                    {thread.isGroup ? t('messages.thread.groupChat', { defaultValue: 'Group Chat' }) : (isUserCompany ? t('messages.thread.employer', { defaultValue: 'Employer' }) : t('messages.thread.candidate', { defaultValue: 'Candidate' }))}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Chat Container */}
        <div className="chat-container">
          <Card className="feature-card bg-card h-[500px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('messages.thread.emptyTitle', { defaultValue: 'No messages yet' })}
                  </h3>
                  <p className="text-muted-foreground 400">
                    {t('messages.thread.emptyDesc', { defaultValue: 'Start the conversation by typing a message below.' })}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isCurrentUser = msg.senderId === currentUser?.user?.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-lg p-4 ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 800 text-foreground '
                          }`}
                        >
                          {thread.isGroup && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`text-xs font-medium ${
                                isCurrentUser ? 'text-blue-100' : 'text-muted-foreground 400'
                              }`}>
                                {isCurrentUser ? t('messages.thread.you', { defaultValue: 'You' }) : (msg.sender?.name || t('messages.thread.unknown', { defaultValue: 'Unknown' }))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            {isCurrentUser ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Building2 className="h-3 w-3" />
                            )}
                            {!thread.isGroup && (
                              <span className="text-xs font-medium">
                                {isCurrentUser ? t('messages.thread.you', { defaultValue: 'You' }) : (msg.sender?.name || t('messages.thread.other', { defaultValue: 'Other' }))}
                              </span>
                            )}
                            <span className={`text-xs ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-500 400'
                            }`}>
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          
                          {/* File Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2">
                              <FilePreview 
                                files={msg.attachments} 
                                className="space-y-1"
                              />
                            </div>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-right text-gray-500' : 'text-left text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                            locale: nl,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <Separator />

            {/* Input Area */}
            <div className="p-6 bg-background 900 rounded-b-lg">
              {/* File Upload Area (when visible) */}
              {showFileUpload && (
                <div className="mb-4 p-4 border rounded-lg bg-white 800">
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    messageId={threadId} // Note: This will need to be adjusted to use actual messageId after sending
                    maxFiles={5}
                  />
                </div>
              )}

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">{t('messages.thread.addedFiles', { defaultValue: 'Added files:' })}</div>
                  <FilePreview 
                    files={uploadedFiles}
                    canRemove={true}
                    onRemove={(fileId) => {
                      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
                    }}
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Textarea
                    placeholder={t('messages.thread.placeholder', { defaultValue: 'Type your message... (Enter = send, Shift+Enter = new line)' })}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                    disabled={sendMessageMutation.isPending}
                    data-testid="textarea-message"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      disabled={sendMessageMutation.isPending}
                      title={t('messages.thread.addFiles', { defaultValue: 'Add files' })}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!message.trim() && uploadedFiles.length === 0) || sendMessageMutation.isPending}
                      className="self-end"
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{t('messages.thread.charCounter', { defaultValue: '{{count}}/1000 characters', count: message.length })}</span>
                  <span>{t('messages.thread.shortcutLegend', { defaultValue: 'Enter = send, Shift+Enter = new line' })}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Video Call Modal */}
      <VideoCall
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        threadId={threadId || ''}
        participantName={currentUser?.user?.name}
      />
      </div>
    </PageWrapper>
  );
}
