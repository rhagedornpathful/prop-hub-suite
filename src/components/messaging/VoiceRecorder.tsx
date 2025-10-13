import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    chunksRef.current = [];
    onCancel?.();
  };

  const sendRecording = () => {
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onRecordingComplete(blob);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {!audioURL ? (
          <>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              className="flex-shrink-0"
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Record
                </>
              )}
            </Button>
            {isRecording && (
              <div className="flex items-center gap-2 flex-1">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <audio src={audioURL} controls className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteRecording}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={sendRecording}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
