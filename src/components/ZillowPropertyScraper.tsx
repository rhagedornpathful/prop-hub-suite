import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PropertyData {
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  price?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  year_built?: number;
  lot_size?: string;
  estimated_value?: number;
}

interface ZillowPropertyScraperProps {
  onDataExtracted: (data: PropertyData) => void;
  className?: string;
}

export function ZillowPropertyScraper({ onDataExtracted, className }: ZillowPropertyScraperProps) {
  const [zillowUrl, setZillowUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidZillowUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('zillow.com') && 
             (url.includes('/homedetails/') || url.includes('/homes/'));
    } catch {
      return false;
    }
  };

  const handleScrape = async () => {
    if (!zillowUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a Zillow property URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidZillowUrl(zillowUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Zillow property URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      console.log('Scraping Zillow URL:', zillowUrl);
      
      const { data, error } = await supabase.functions.invoke('scrape-zillow-property', {
        body: { zillowUrl }
      });

      if (error) {
        throw new Error(error.message || 'Failed to scrape property data');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to extract property data');
      }

      const propertyData = data.propertyData;
      console.log('Scraped property data received in ZillowPropertyScraper:', propertyData);

      setScrapedData(propertyData);
      
      // Map the scraped data to match the form's expected field names
      const mappedData = {
        ...propertyData,
        // Map price to estimated_value if price exists but estimated_value doesn't
        estimated_value: propertyData.estimated_value || propertyData.price,
        // Remove the price field since we've mapped it to estimated_value
        price: undefined
      };

      // Filter out null/undefined values before passing to parent
      const cleanData = Object.fromEntries(
        Object.entries(mappedData).filter(([_, value]) => value != null)
      );

      console.log('Clean data being sent to parent component:', cleanData);

      toast({
        title: "Property Data Extracted",
        description: "Successfully scraped property information from Zillow",
      });

      onDataExtracted(cleanData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape property data';
      console.error('Error scraping Zillow:', err);
      setError(errorMessage);
      
      toast({
        title: "Scraping Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (key: string, value: any) => {
    switch (key) {
      case 'bedrooms':
        return `${value} bed${value !== 1 ? 's' : ''}`;
      case 'bathrooms':
        return `${value} bath${value !== 1 ? 's' : ''}`;
      case 'square_feet':
        return `${value?.toLocaleString()} sq ft`;
      case 'estimated_value':
        return `$${value?.toLocaleString()}`;
      case 'year_built':
        return `Built ${value}`;
      case 'property_type':
        return value?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      case 'city':
        return `City: ${value}`;
      case 'state':
        return `State: ${value}`;
      case 'zip_code':
        return `ZIP: ${value}`;
      case 'address':
        return `Address: ${value}`;
      case 'lot_size':
        return `Lot: ${value}`;
      default:
        return value;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Import from Zillow
        </CardTitle>
        <CardDescription>
          Enter a Zillow property URL to automatically extract property details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="zillow-url">Zillow Property URL</Label>
          <div className="flex gap-2">
            <Input
              id="zillow-url"
              type="url"
              value={zillowUrl}
              onChange={(e) => setZillowUrl(e.target.value)}
              placeholder="https://www.zillow.com/homedetails/..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleScrape} 
              disabled={isLoading || !zillowUrl}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Import'
              )}
            </Button>
          </div>
          {zillowUrl && !isValidZillowUrl(zillowUrl) && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid Zillow property URL
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 border border-destructive/20 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {scrapedData && Object.keys(scrapedData).some(key => scrapedData[key as keyof PropertyData] != null) && (
          <div className="p-3 border border-primary/20 bg-primary/5 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Extracted Data:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(scrapedData)
                .filter(([_, value]) => value != null)
                .map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {formatValue(key, value)}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Tip:</strong> Copy the URL from a Zillow property listing page for best results.</p>
          <p>Supported formats: zillow.com/homedetails/ or zillow.com/homes/</p>
        </div>
      </CardContent>
    </Card>
  );
}