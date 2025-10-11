import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  generateSizes 
} from '@/lib/performance/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
  aspectRatio?: string;
}

export const OptimizedImageV2 = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder.svg',
  onLoad,
  onError,
  priority = false,
  width,
  height,
  quality = 80,
  objectFit = 'cover',
  sizes,
  aspectRatio,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(true);
    onError?.();
  };

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format: 'auto',
  });

  const srcSet = generateSrcSet(src, [320, 640, 768, 1024, 1280, 1536]);
  
  const imageSizes = sizes || generateSizes([
    { breakpoint: '640px', size: '100vw' },
    { breakpoint: '768px', size: '50vw' },
    { size: '33vw' },
  ]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Image */}
      {isInView && (
        <picture>
          {/* WebP source with srcset */}
          <source
            type="image/webp"
            srcSet={srcSet.replace(/\.(jpg|jpeg|png)/g, '.webp')}
            sizes={imageSizes}
          />
          
          {/* Fallback source with srcset */}
          <source
            type="image/jpeg"
            srcSet={srcSet}
            sizes={imageSizes}
          />
          
          {/* img element */}
          <img
            src={isError ? fallback : optimizedSrc}
            alt={alt}
            className={`
              w-full h-full transition-opacity duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ objectFit }}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            width={width}
            height={height}
          />
        </picture>
      )}
    </div>
  );
};
