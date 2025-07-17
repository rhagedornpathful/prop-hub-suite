import React, { useState, useRef, useEffect } from 'react';
import { Play, X, ZoomIn } from 'lucide-react';

interface ResponsiveMediaProps {
  src: string;
  alt: string;
  type?: 'image' | 'video';
  className?: string;
  aspectRatio?: 'square' | 'video' | 'photo' | 'portrait';
  lazy?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // For above-the-fold content
  sizes?: string; // For responsive images
}

export const ResponsiveMedia: React.FC<ResponsiveMediaProps> = ({
  src,
  alt,
  type = 'image',
  className = '',
  aspectRatio = 'photo',
  lazy = true,
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lazy && !priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      if (mediaRef.current) {
        observer.observe(mediaRef.current);
      }

      return () => observer.disconnect();
    }
  }, [lazy, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-photo',
    portrait: 'aspect-portrait'
  };

  if (type === 'video') {
    return (
      <div 
        ref={mediaRef} 
        className={`relative overflow-hidden video-container ${className}`}
      >
        {isInView && (
          <video
            className="responsive-video"
            controls
            preload={priority ? 'metadata' : 'none'}
            poster={placeholder}
            onLoadedData={handleLoad}
            onError={handleError}
          >
            <source src={src} type="video/mp4" />
            <p>Your browser doesn't support HTML video. <a href={src}>Download the video</a> instead.</p>
          </video>
        )}
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted/30 flex items-center justify-center">
            <Play className="w-12 h-12 text-white/80" />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div 
        ref={mediaRef} 
        className={`relative overflow-hidden image-wrapper ${aspectRatioClasses[aspectRatio]} ${className}`}
        onClick={() => setShowFullscreen(true)}
      >
        {!isLoaded && !isError && (
          <div className="absolute inset-0 w-full h-full image-loading" />
        )}
        
        {isInView && (
          <img
            src={isError ? placeholder : src}
            alt={alt}
            className={`
              responsive-image-fill lazy-image cursor-pointer
              transition-all duration-300 hover:scale-105
              ${isLoaded ? 'opacity-100 loaded' : 'opacity-0'}
            `}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            decoding="async"
            sizes={sizes}
          />
        )}

        {isLoaded && !isError && (
          <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
            <button 
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 touch-target"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullscreen(true);
              }}
              aria-label="View fullscreen"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 image-error">
            <div className="text-center">
              <svg 
                className="w-12 h-12 text-muted-foreground mx-auto mb-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-muted-foreground">Image unavailable</span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && !isError && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 touch-dismissible"
          onClick={() => setShowFullscreen(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full touch-target"
            onClick={() => setShowFullscreen(false)}
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain responsive-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

// Image Gallery Component with mobile-optimized grid
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
}

export const ResponsiveImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = ''
}) => {
  return (
    <div className={`image-grid-mobile ${className}`}>
      {images.map((image, index) => (
        <div key={index} className="relative">
          <ResponsiveMedia
            src={image.src}
            alt={image.alt}
            aspectRatio="photo"
            lazy={index > 2} // First 3 images load immediately
            priority={index === 0} // Hero image gets priority
          />
          {image.caption && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// Hero Image Component with optimized loading
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

export const ResponsiveHeroImage: React.FC<HeroImageProps> = ({
  src,
  alt,
  className = '',
  overlay = false,
  children
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ResponsiveMedia
        src={src}
        alt={alt}
        aspectRatio="video"
        priority={true} // Hero images should load immediately
        lazy={false}
        className="w-full h-full"
        sizes="100vw" // Hero images are full width
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      )}
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center text-white">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveMedia;