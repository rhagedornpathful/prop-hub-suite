import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PhotoResult {
  dataUrl: string;
  format: string;
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
