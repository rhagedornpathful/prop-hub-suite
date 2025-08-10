import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Download, Trash2, RotateCcw, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CapturedPhoto {
  id: string;
  url: string;
  timestamp: Date;
  description?: string;
  location?: string;
}

interface HouseWatcherCameraIntegrationProps {
  sessionId: string;
  onPhotoCapture?: (photo: CapturedPhoto) => void;
  className?: string;
}

export const HouseWatcherCameraIntegration = ({ 
  sessionId, 
  onPhotoCapture, 
  className 
}: HouseWatcherCameraIntegrationProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error: any) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 100);
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      try {
        // Generate unique filename
        const filename = `check-${sessionId}-${Date.now()}.jpg`;
        const filePath = `house-watching/${sessionId}/${filename}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        // Create photo object
        const photo: CapturedPhoto = {
          id: crypto.randomUUID(),
          url: publicUrl,
          timestamp: new Date(),
          location: await getCurrentLocation()
        };

        setCapturedPhotos(prev => [...prev, photo]);
        
        // Log activity
        await supabase
          .from('home_check_activities')
          .insert({
            session_id: sessionId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            activity_type: 'photo_captured',
            activity_data: {
              photo_url: publicUrl,
              filename: filename,
              timestamp: photo.timestamp.toISOString()
            }
          });

        onPhotoCapture?.(photo);
        
        toast({
          title: "Photo Captured",
          description: "Photo has been saved to the check session.",
        });

      } catch (error: any) {
        toast({
          title: "Upload Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }, 'image/jpeg', 0.9);
  }, [sessionId, onPhotoCapture]);

  const getCurrentLocation = async (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const filename = `upload-${sessionId}-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `house-watching/${sessionId}/${filename}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      const photo: CapturedPhoto = {
        id: crypto.randomUUID(),
        url: publicUrl,
        timestamp: new Date()
      };

      setCapturedPhotos(prev => [...prev, photo]);
      onPhotoCapture?.(photo);
      
      toast({
        title: "Photo Uploaded",
        description: "Photo has been uploaded successfully.",
      });

    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deletePhoto = async (photo: CapturedPhoto) => {
    try {
      // Extract file path from URL
      const urlParts = photo.url.split('/');
      const filePath = urlParts.slice(-3).join('/'); // house-watching/sessionId/filename
      
      await supabase.storage
        .from('property-images')
        .remove([filePath]);
      
      setCapturedPhotos(prev => prev.filter(p => p.id !== photo.id));
      
      toast({
        title: "Photo Deleted",
        description: "Photo has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const downloadPhoto = (photo: CapturedPhoto) => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `check-photo-${photo.timestamp.getTime()}.jpg`;
    a.click();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo Documentation
          <Badge variant="secondary">{capturedPhotos.length} photos</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Controls */}
        <div className="flex flex-wrap gap-2">
          {!isCapturing ? (
            <Button onClick={startCamera}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={capturePhoto} variant="default">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button onClick={switchCamera} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Switch
              </Button>
              <Button onClick={stopCamera} variant="secondary">
                Stop Camera
              </Button>
            </>
          )}
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Camera View */}
        {isCapturing && (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              className="w-full max-h-64 object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Photo Gallery */}
        {capturedPhotos.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Captured Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {capturedPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.url} 
                    alt="Captured during check"
                    className="w-full h-24 object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => downloadPhoto(photo)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deletePhoto(photo)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-xs bg-black/75 text-white p-1 rounded truncate">
                      {photo.timestamp.toLocaleTimeString()}
                      {photo.location && (
                        <div className="text-xs opacity-75">📍 GPS</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};