import React from 'react';
import { Building } from 'lucide-react';

interface PropertyImageProps {
  imageUrl?: string;
  address: string;
  className?: string;
}

export const PropertyImage: React.FC<PropertyImageProps> = ({
  imageUrl,
  address,
  className = "w-full h-48 object-cover rounded-lg"
}) => {
  return (
    <div className="relative image-wrapper">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`Property at ${address}`}
          className={`responsive-image-fill lazy-image ${className}`}
          loading="lazy"
          onLoad={(e) => {
            e.currentTarget.classList.add('loaded');
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="${className} bg-muted/30 flex items-center justify-center border border-border/50 image-error">
                  <div class="text-center">
                    <svg class="w-12 h-12 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span class="text-sm text-muted-foreground">Image not available</span>
                  </div>
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className={`${className} bg-muted/30 flex items-center justify-center border border-border/50 image-error`}>
          <div className="text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">No Image Available</span>
          </div>
        </div>
      )}
    </div>
  );
};