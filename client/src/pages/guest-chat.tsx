import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Send,
  Clock,
  Building2,
  MapPin,
  User,
  AlertCircle,
  CheckCircle2,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api-client";
import { PageWrapper } from "@/components/page-wrapper";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

interface GuestChatSession {
  id: string;
  guestName?: string;
  guestEmail?: string;
  messageCount: number;
  maxMessages: number;
  expiresAt: string;
  status: string;
}

interface Recruiter {
  name: string;
  companyName?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
}

interface GuestMessage {
  id: string;
  threadId: string;
  senderId?: string;
  guestChatSessionId?: string;
  senderName?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: { name: string };
}

interface GuestChatData {
  session: GuestChatSession;
  recruiter?: Recruiter;
  job?: Job;
}

interface MessagesData {
  messages: GuestMessage[];
  session: {
    id: string;
    messageCount: number;
    maxMessages: number;
    expiresAt: string;
  };
}

export default function GuestChat() {
  const { token } = useParams();
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch session info
  const { 
    data: sessionData, 
    isLoading: isLoadingSession, 
    error: sessionError 
  } = useQuery<GuestChatData>({
    queryKey: [`/api/guest-chat/${token}`],
    enabled: !!token,
  });

  // Fetch messages
  const { 
    data: messagesData, 
    isLoading: isLoadingMessages,
    error: messagesError 
  } = useQuery<MessagesData>({
    queryKey: [`/api/guest-chat/${token}/messages`],
    enabled: !!token && isNameSet,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, senderName }: { content: string; senderName: string }) => {
      const response = await apiPost(`/api/guest-chat/${token}/message`, { content, senderName });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }

      return response.data;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/guest-chat/${token}/messages`] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Initialize guest name from session data
  useEffect(() => {
    if (sessionData?.session?.guestName && !isNameSet) {
      setGuestName(sessionData.session.guestName);
      setIsNameSet(true);
    }
  }, [sessionData, isNameSet]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages]);

  const handleSetName = () => {
    if (!guestName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to start chatting",
        variant: "destructive",
      });
      return;
    }
    setIsNameSet(true);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {return;}
    
    if (message.length > 2000) {
      toast({
        title: "Message too long",
        description: "Message cannot exceed 2000 characters",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      content: message.trim(),
      senderName: guestName.trim()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRemainingMessages = () => {
    if (!messagesData?.session) {return 0;}
    return messagesData.session.maxMessages - messagesData.session.messageCount;
  };

  if (isLoadingSession) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('guestChat.loadingSession', { defaultValue: 'Loading chat session...' })}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (sessionError || !sessionData) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full feature-card bg-card">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-foreground mb-2">{t('guestChat.notAvailableTitle')}</h1>
              <p className="text-muted-foreground mb-4">{t('guestChat.notAvailableDesc')}</p>
              <p className="text-sm text-muted-foreground">{t('guestChat.contactSender')}</p>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  const { session, recruiter, job } = sessionData;

  return (
    <PageWrapper>
      <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-6 feature-card bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    {t('guestChat.title', { defaultValue: 'Guest Chat' })}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {recruiter && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {recruiter.name}
                        {recruiter.companyName && ` (${recruiter.companyName})`}
                      </div>
                    )}
                    {job && (
                      <>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.title}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-2">
                    {t('guestChat.title', { defaultValue: 'Guest Chat' })}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('guestChat.expires', { defaultValue: 'Expires {{time}}', time: formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true }) })}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Name Input (if not set) */}
          {!isNameSet && (
            <Card className="mb-6 feature-card bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('guestChat.welcomeTitle', { defaultValue: 'Welcome to the chat!' })}</h3>
                  <p className="text-muted-foreground mb-4">{t('guestChat.welcomeDesc', { defaultValue: 'Please enter your name to start the conversation.' })}</p>
                  
                  <div className="max-w-sm mx-auto space-y-4">
                    <div>
                      <Label htmlFor="guest-name">{t('guestChat.yourName', { defaultValue: 'Your Name' })}</Label>
                      <Input
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder={t('guestChat.namePlaceholder', { defaultValue: 'Enter your name' })}
                        onKeyPress={(e) => e.key === 'Enter' && handleSetName()}
                      />
                    </div>
                    <Button onClick={handleSetName} className="w-full">
                      {t('guestChat.startChat', { defaultValue: 'Start Chatting' })}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Interface (if name is set) */}
          {isNameSet && (
            <>
              {/* Message limits warning */}
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {t('guestChat.remaining', { defaultValue: 'You have {{count}} messages remaining out of {{max}}', count: getRemainingMessages(), max: session.maxMessages })}
                  </span>
                  <span className="text-xs">
                    {t('guestChat.sessionExpires', { defaultValue: 'Session expires {{time}}', time: formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true }) })}
                  </span>
                </AlertDescription>
              </Alert>

              {/* Messages */}
              <Card className="mb-6 feature-card bg-card">
                <div className="h-[500px] flex flex-col">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoadingMessages ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">{t('guestChat.loadingMessages', { defaultValue: 'Loading messages...' })}</p>
                      </div>
                    ) : messagesData?.messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">{t('guestChat.startTitle', { defaultValue: 'Start the conversation' })}</h3>
                        <p className="text-muted-foreground">{t('guestChat.startDesc', { defaultValue: 'Send a message below to begin chatting with {{name}}.', name: recruiter?.name || t('guestChat.theRecruiter', { defaultValue: 'the recruiter' }) })}</p>
                      </div>
                    ) : (
                      messagesData?.messages.map((msg) => {
                        const isOwnMessage = msg.guestChatSessionId && !msg.senderId;
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              {!isOwnMessage && (
                                <p className="text-xs font-semibold mb-1">
                                  {msg.sender?.name || msg.senderName || t('guestChat.recruiter', { defaultValue: 'Recruiter' })}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <Separator />

                  {/* Message Input */}
                  <div className="p-4">
                    {getRemainingMessages() > 0 ? (
                      <>
                        <div className="flex gap-2">
                          <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('guestChat.messagePlaceholder', { defaultValue: 'Type your message...' })}
                            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                            disabled={sendMessageMutation.isPending}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || sendMessageMutation.isPending}
                            className="self-end"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                          <span>{t('guestChat.charCounter', { defaultValue: '{{count}}/2000 characters', count: message.length })}</span>
                          <span>{t('guestChat.shortcutLegend', { defaultValue: 'Enter = send, Shift+Enter = new line' })}</span>
                        </div>
                      </>
                    ) : (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          {t('guestChat.limitReached', { defaultValue: "You've reached the message limit for this guest session." })} 
                          {t('guestChat.limitReachedHint', { defaultValue: 'To continue chatting, you can create a full account with the company.' })}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </Card>

              {/* Job Information */}
              {job && (
                <Card className="feature-card bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('guestChat.aboutJob', { defaultValue: 'About this job' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{job.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{job.location}</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {job.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </PageWrapper>
  );
}
