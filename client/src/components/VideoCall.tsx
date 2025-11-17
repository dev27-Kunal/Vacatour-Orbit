import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  roomName?: string;
  participantName?: string;
}

interface JitsiMeetJS {
  init: (options?: any) => void;
  createLocalTracks: (options: any) => Promise<any[]>;
  JitsiConnection: new (appId: string, token: string, options: any) => any;
  events: {
    connectionEvents: any;
    conferenceEvents: any;
  };
  mediaDevices: {
    isDeviceChangeAvailable: () => boolean;
  };
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: any) => any;
    JitsiMeetJS: JitsiMeetJS;
  }
}

export function VideoCall({ isOpen, onClose, threadId, roomName, participantName }: VideoCallProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [displayName, setDisplayName] = useState(participantName || '');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const { toast } = useToast();

  // Generate room name based on thread ID and timestamp
  const generateRoomName = () => {
    return `vacature-orbit-${threadId}-${Date.now()}`;
  };

  // Load Jitsi Meet External API script
  const loadJitsiScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Jitsi Meet script'));
      document.head.appendChild(script);
    });
  };

  // Start video call
  const startCall = async () => {
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load Jitsi script if not already loaded
      await loadJitsiScript();

      if (!jitsiContainerRef.current) {
        throw new Error('Video container not available');
      }

      const finalRoomName = roomName || generateRoomName();
      
      // Initialize Jitsi Meet API
      const options = {
        roomName: finalRoomName,
        width: '100%',
        height: 500,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          // Disable some features for better UX
          startWithAudioMuted: isMuted,
          startWithVideoMuted: !isVideoEnabled,
          enableWelcomePage: false,
          enableClosePage: false,
          prejoinPageEnabled: false,
          // Security settings
          enableNoisyMicDetection: true,
          startAudioOnly: false,
          // UI customization
          disableInviteFunctions: true,
          doNotStoreRoom: true,
          startScreenSharing: false,
          enableEmailInStats: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
        }
      };

      // Create API instance
      apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);

      // Set display name
      apiRef.current.executeCommand('displayName', displayName);

      // Add event listeners
      apiRef.current.addEventListeners({
        readyToClose: () => {
          endCall();
        },
        videoConferenceJoined: () => {
          setIsCallActive(true);
          setIsLoading(false);
          toast({
            title: "Joined video call",
            description: "You are now connected to the video call",
          });
        },
        videoConferenceLeft: () => {
          setIsCallActive(false);
          toast({
            title: "Left video call",
            description: "You have disconnected from the video call",
          });
        },
        participantJoined: (participant: any) => {
          toast({
            title: "Participant joined",
            description: `${participant.displayName || 'Someone'} joined the call`,
          });
        },
        participantLeft: (participant: any) => {
          toast({
            title: "Participant left",
            description: `${participant.displayName || 'Someone'} left the call`,
          });
        },
        audioMuteStatusChanged: (data: any) => {
          setIsMuted(data.muted);
        },
        videoMuteStatusChanged: (data: any) => {
          setIsVideoEnabled(!data.muted);
        }
      });

    } catch (err) {
      console.error('Error starting video call:', err);
      setError('Failed to start video call. Please try again.');
      setIsLoading(false);
    }
  };

  // End video call
  const endCall = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    setIsCallActive(false);
    setIsLoading(false);
    onClose();
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Call
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isCallActive && !isLoading && (
            <div className="space-y-4 p-4">
              <div>
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name for the call"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isMuted ? "Mic Off" : "Mic On"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={!isVideoEnabled ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {!isVideoEnabled ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    {!isVideoEnabled ? "Camera Off" : "Camera On"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={startCall} 
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Start Video Call
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Connecting to video call...</p>
              </div>
            </div>
          )}

          <div 
            ref={jitsiContainerRef} 
            className={`flex-1 ${isCallActive ? 'block' : 'hidden'}`}
            style={{ minHeight: '400px' }}
          />

          {isCallActive && (
            <div className="flex justify-center gap-2 p-4 border-t">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMicrophone}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={!isVideoEnabled ? "destructive" : "outline"}
                size="sm"
                onClick={toggleCamera}
              >
                {!isVideoEnabled ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={endCall}
              >
                <PhoneOff className="h-4 w-4 mr-1" />
                End Call
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}