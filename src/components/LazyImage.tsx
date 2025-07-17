import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden image-wrapper ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 w-full h-full bg-muted animate-pulse" />
      )}
      
      {isInView && (
        <img
          src={isError ? placeholder : src}
          alt={alt}
          className={`
            w-full h-full object-contain lazy-image transition-all duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};