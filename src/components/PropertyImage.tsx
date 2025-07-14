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
    <div className="relative">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`Property at ${address}`}
          className={className}
        />
      ) : (
        <div className={`${className} bg-muted/30 flex items-center justify-center border border-border/50`}>
          <div className="text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">No Image Available</span>
          </div>
        </div>
      )}
    </div>
  );
};