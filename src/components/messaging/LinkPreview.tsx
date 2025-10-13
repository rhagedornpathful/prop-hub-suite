import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
}

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract basic metadata from URL
    const extractMetadata = () => {
      try {
        const urlObj = new URL(url);
        setMetadata({
          domain: urlObj.hostname,
          title: urlObj.hostname,
          description: url,
        });
      } catch (e) {
        console.error('Invalid URL:', e);
      }
      setLoading(false);
    };

    extractMetadata();
  }, [url]);

  if (loading) {
    return (
      <Card className="p-3 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-full" />
      </Card>
    );
  }

  if (!metadata) return null;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block no-underline"
    >
      <Card className="p-3 hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex gap-3">
          {metadata.image && (
            <img 
              src={metadata.image} 
              alt={metadata.title} 
              className="w-20 h-20 object-cover rounded flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-1">
                {metadata.title}
              </h4>
              <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            {metadata.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {metadata.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {metadata.domain}
            </p>
          </div>
        </div>
      </Card>
    </a>
  );
};
