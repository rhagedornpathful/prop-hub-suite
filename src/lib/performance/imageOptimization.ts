/**
 * Image optimization utilities
 * Handles WebP conversion, responsive sizes, lazy loading, and CDN integration
 */

const SUPABASE_URL = 'https://nhjsxtwuweegqcexakoz.supabase.co';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: number;
}

export interface CDNConfig {
  enabled: boolean;
  baseUrl?: string;
  transformPath?: string;
}

/**
 * Generate optimized image URL with CDN support
 * Supports Supabase storage transformations and CloudFlare CDN integration
 */
export const getOptimizedImageUrl = (
  src: string,
  options: ImageOptimizationOptions = {},
  cdnConfig?: CDNConfig
): string => {
  if (!src) return '';
  
  // CloudFlare CDN integration
  if (cdnConfig?.enabled && cdnConfig.baseUrl) {
    const transformParams = [];
    
    if (options.width) transformParams.push(`w=${options.width}`);
    if (options.height) transformParams.push(`h=${options.height}`);
    if (options.quality) transformParams.push(`q=${options.quality}`);
    if (options.format) transformParams.push(`f=${options.format}`);
    if (options.fit) transformParams.push(`fit=${options.fit}`);
    if (options.blur) transformParams.push(`blur=${options.blur}`);
    
    const transformPath = transformParams.length > 0 ? transformParams.join(',') : 'original';
    
    // Extract path from original URL
    const srcPath = src.replace(/^https?:\/\/[^/]+/, '');
    return `${cdnConfig.baseUrl}/cdn-cgi/image/${transformPath}${srcPath}`;
  }
  
  // Supabase storage transformations
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    // Supabase specific transformation parameters
    const bucket = url.pathname.split('/')[3];
    if (bucket === 'property-images') {
      // Public bucket - can use transformation
      const transformPath = `/render/image/authenticated/${bucket}`;
      url.pathname = url.pathname.replace(`/storage/v1/object/public/${bucket}`, transformPath);
    }
    
    if (params.toString()) {
      url.search = params.toString();
    }
    
    return url.toString();
  }
  
  return src;
};

/**
 * Get CloudFlare CDN configuration from environment
 */
export const getCDNConfig = (): CDNConfig => {
  return {
    enabled: false, // Enable when CloudFlare is configured
    baseUrl: undefined, // Set to your CloudFlare domain when ready
  };
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
