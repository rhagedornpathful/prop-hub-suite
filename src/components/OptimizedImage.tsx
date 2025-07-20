import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder.svg',
  onLoad,
  onError,
  priority = false,
  sizes = '100vw',
  quality = 75,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate WebP and different sizes
  useEffect(() => {
    if (src && isInView) {
      // Check if browser supports WebP
      const canvas = document.createElement('canvas');
      const canUseWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      
      // For demo purposes, we'll assume the image service can convert to WebP
      // In a real implementation, you'd have an image processing service
      let optimized = src;
      
      if (canUseWebP && !src.includes('.webp')) {
        // Convert to WebP if supported and not already WebP
        optimized = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
      }
      
      setOptimizedSrc(optimized);
    }
  }, [src, isInView]);

  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 w-full h-full">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {isInView && (
        <picture>
          {/* WebP source */}
          <source 
            srcSet={optimizedSrc} 
            type="image/webp" 
            sizes={sizes}
          />
          {/* Fallback */}
          <img
            src={isError ? fallback : (optimizedSrc || src)}
            alt={alt}
            className={`
              w-full h-full object-cover transition-all duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            sizes={sizes}
          />
        </picture>
      )}
    </div>
  );
};