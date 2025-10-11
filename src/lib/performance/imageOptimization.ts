/**
 * Image optimization utilities
 * Handles WebP conversion, responsive sizes, lazy loading, and CDN integration
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: number;
}

/**
 * Generate optimized image URL
 * In production, this would integrate with a CDN/image service
 */
export const getOptimizedImageUrl = (
  src: string,
  options: ImageOptimizationOptions = {}
): string => {
  if (!src) return '';
  
  // If it's a Supabase storage URL, we can add transformation params
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    url.search = params.toString();
    return url.toString();
  }
  
  return src;
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  src: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1536]
): string => {
  return sizes
    .map(size => `${getOptimizedImageUrl(src, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Generate sizes attribute based on breakpoints
 */
export const generateSizes = (
  config: Array<{ breakpoint?: string; size: string }>
): string => {
  return config
    .map(({ breakpoint, size }) => 
      breakpoint ? `(max-width: ${breakpoint}) ${size}` : size
    )
    .join(', ');
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;
  document.head.appendChild(link);
};

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
};

/**
 * Convert image to WebP format (client-side)
 */
export const convertToWebP = async (
  file: File,
  quality: number = 0.8
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress image before upload
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
