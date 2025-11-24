import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PhotoResult {
  dataUrl: string;
  format: string;
}

export interface MediaResult {
  dataUrl: string;
  format: string;
  type: 'photo' | 'video';
  duration?: number; // For videos
}

export const takePhoto = async (): Promise<PhotoResult | null> => {
  try {
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // Fallback to web file input
      return await takePhotoWeb();
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (!image.dataUrl) {
      throw new Error('No image data received');
    }

    return {
      dataUrl: image.dataUrl,
      format: image.format,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const selectPhoto = async (): Promise<PhotoResult | null> => {
  try {
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // Fallback to web file input
      return await takePhotoWeb();
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    if (!image.dataUrl) {
      throw new Error('No image data received');
    }

    return {
      dataUrl: image.dataUrl,
      format: image.format,
    };
  } catch (error) {
    console.error('Error selecting photo:', error);
    return null;
  }
};

// Fallback for web platform
const takePhotoWeb = (): Promise<PhotoResult | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          dataUrl: reader.result as string,
          format: file.type.split('/')[1] || 'jpeg',
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
};

// Record video using native camera
export const recordVideo = async (): Promise<MediaResult | null> => {
  try {
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // Fallback to web video capture
      return await recordVideoWeb();
    }

    // For native, we'll use file picker for now since Capacitor Camera doesn't support video
    // In production, you'd use a plugin like capacitor-video-recorder
    return await recordVideoWeb();
  } catch (error) {
    console.error('Error recording video:', error);
    return null;
  }
};

// Fallback for web video recording
const recordVideoWeb = (): Promise<MediaResult | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.capture = 'environment';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          resolve({
            dataUrl: reader.result as string,
            format: file.type.split('/')[1] || 'mp4',
            type: 'video',
            duration: video.duration,
          });
        };
        video.src = URL.createObjectURL(file);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
};
