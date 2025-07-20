import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Calendar,
  Building,
  Camera,
  ScreenShare,
  MessageSquare,
  Settings
} from 'lucide-react';

interface VideoCall {
  id: string;
  title: string;
  type: 'property_tour' | 'maintenance_consultation' | 'general_meeting';
  property_id?: string;
  participants: string[];
  scheduled_for: string;
  duration_minutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  meeting_url?: string;
  recording_url?: string;
}

interface VideoCallSystemProps {
  onClose?: () => void;
}

export const VideoCallSystem: React.FC<VideoCallSystemProps> = ({ onClose }) => {
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [upcomingCalls, setUpcomingCalls] = useState<VideoCall[]>([]);
  
  // New call form state
  const [newCallTitle, setNewCallTitle] = useState('');
  const [newCallType, setNewCallType] = useState<'property_tour' | 'maintenance_consultation' | 'general_meeting'>('property_tour');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [participantEmails, setParticipantEmails] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load upcoming video calls
    loadUpcomingCalls();
  }, []);

  const loadUpcomingCalls = async () => {
    // Mock data - in real implementation, fetch from database
    const mockCalls: VideoCall[] = [
      {
        id: '1',
        title: 'Property Tour - 123 Main St',
        type: 'property_tour',
        property_id: 'prop_1',
        participants: ['tenant@example.com', 'manager@example.com'],
        scheduled_for: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        duration_minutes: 30,
        status: 'scheduled',
        meeting_url: 'https://meet.example.com/property-tour-123'
      },
      {
        id: '2',
        title: 'Maintenance Consultation',
        type: 'maintenance_consultation',
        participants: ['contractor@example.com', 'owner@example.com'],
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration_minutes: 45,
        status: 'scheduled'
      }
    ];
    setUpcomingCalls(mockCalls);
  };

  const scheduleCall = async () => {
    if (!newCallTitle.trim() || !scheduledTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const newCall: VideoCall = {
      id: Date.now().toString(),
      title: newCallTitle,
      type: newCallType,
      property_id: selectedProperty || undefined,
      participants: participantEmails.split(',').map(email => email.trim()),
      scheduled_for: scheduledTime,
      duration_minutes: 30,
      status: 'scheduled',
      meeting_url: `https://meet.example.com/${Date.now()}`
    };

    setUpcomingCalls([...upcomingCalls, newCall]);
    setShowScheduleDialog(false);
    
    // Reset form
    setNewCallTitle('');
    setSelectedProperty('');
    setScheduledTime('');
    setParticipantEmails('');

    toast({
      title: 'Call Scheduled',
      description: 'Video call has been scheduled and invitations sent',
    });
  };

  const startCall = async (call: VideoCall) => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setActiveCall(call);
      
      toast({
        title: 'Call Started',
        description: `Started ${call.title}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access camera/microphone',
        variant: 'destructive'
      });
    }
  };

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    setActiveCall(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);

    toast({
      title: 'Call Ended',
      description: 'Video call has been ended',
    });
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsScreenSharing(true);

      // Listen for screen share end
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        // Switch back to camera
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        }).then(cameraStream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = cameraStream;
          }
        });
      };
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start screen sharing',
        variant: 'destructive'
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'property_tour': return <Building className="h-4 w-4" />;
      case 'maintenance_consultation': return <Settings className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'property_tour': return 'bg-blue-100 text-blue-800';
      case 'maintenance_consultation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (activeCall) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Video Call Interface */}
        <div className="flex-1 flex">
          {/* Main video area */}
          <div className="flex-1 relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local video overlay */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Call info overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <h3 className="font-medium">{activeCall.title}</h3>
              <p className="text-sm opacity-80">{activeCall.participants.length} participants</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "secondary" : "outline"}
            size="lg"
            onClick={startScreenShare}
            className="rounded-full w-12 h-12"
          >
            <ScreenShare className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Calls</h2>
          <p className="text-muted-foreground">Virtual property tours and meetings</p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Call
        </Button>
      </div>

      {/* Upcoming Calls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upcoming Calls</h3>
        <div className="grid gap-4">
          {upcomingCalls.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming video calls</p>
                <p className="text-sm text-gray-400">Schedule a call to get started</p>
              </CardContent>
            </Card>
          ) : (
            upcomingCalls.map((call) => (
              <Card key={call.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCallTypeIcon(call.type)}
                        <h4 className="font-medium">{call.title}</h4>
                        <Badge variant="secondary" className={getCallTypeColor(call.type)}>
                          {call.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>📅 {formatDateTime(call.scheduled_for)}</p>
                        <p>⏱️ {call.duration_minutes} minutes</p>
                        <p>👥 {call.participants.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(call.meeting_url || '')}
                      >
                        Copy Link
                      </Button>
                      <Button
                        onClick={() => startCall(call)}
                        size="sm"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Schedule Call Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Video Call</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="call-title">Call Title</Label>
              <Input
                id="call-title"
                placeholder="e.g., Property Tour - 123 Main St"
                value={newCallTitle}
                onChange={(e) => setNewCallTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="call-type">Call Type</Label>
              <Select value={newCallType} onValueChange={(value: any) => setNewCallType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property_tour">Property Tour</SelectItem>
                  <SelectItem value="maintenance_consultation">Maintenance Consultation</SelectItem>
                  <SelectItem value="general_meeting">General Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduled-time">Date & Time</Label>
              <Input
                id="scheduled-time"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="participants">Participant Emails</Label>
              <Textarea
                id="participants"
                placeholder="Enter email addresses separated by commas"
                value={participantEmails}
                onChange={(e) => setParticipantEmails(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => setShowScheduleDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={scheduleCall} className="flex-1">
                Schedule Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCallSystem;