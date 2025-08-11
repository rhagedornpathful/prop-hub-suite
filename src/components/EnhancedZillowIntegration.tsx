import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ExternalLink, Loader2, Check, AlertCircle, RefreshCw, 
  TrendingUp, Map, DollarSign, Home, Calendar, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PropertyData {
  // Basic info
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  property_type?: string;
  year_built?: number;
  lot_size?: string;
  
  // Financial
  price?: number;
  estimated_value?: number;
  rent_estimate?: number;
  hoa_fees?: number;
  property_taxes?: number;
  
  // Market data
  days_on_market?: number;
  price_per_sqft?: number;
  
  // Scores and ratings
  walkability_score?: number;
  school_rating?: number;
  neighborhood_score?: number;
  
  // Additional data
  images?: string[];
  amenities?: string[];
  nearby_attractions?: string[];
  energy_efficiency_rating?: string;
  
  // Meta
  zillow_data?: any;
  last_zillow_sync?: string;
  data_sources?: any;
}

interface EnhancedZillowIntegrationProps {
  onDataExtracted: (data: PropertyData) => void;
  propertyId?: string;
  existingProperty?: any;
  className?: string;
}

export const EnhancedZillowIntegration: React.FC<EnhancedZillowIntegrationProps> = ({
  onDataExtracted,
  propertyId,
  existingProperty,
  className
}) => {
  const [zillowUrl, setZillowUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('scrape');
  
  const { toast } = useToast();

  const isValidZillowUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('zillow.com') && 
             (url.includes('/homedetails/') || url.includes('/homes/'));
    } catch {
      return false;
    }
  };

  const handleScrape = async (updateExisting = false) => {
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
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('Enhanced scraping:', { zillowUrl, propertyId, updateExisting });
      
      const { data, error } = await supabase.functions.invoke('scrape-property', {
        body: { 
          url: zillowUrl,
          propertyId: updateExisting ? propertyId : null,
          updateExisting
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw new Error(error.message || 'Failed to scrape property data');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to extract property data');
      }

      const propertyData = data.propertyData;
      console.log('Enhanced scraped data:', propertyData);

      setScrapedData(propertyData);
      
      toast({
        title: updateExisting ? "Property Updated" : "Data Extracted",
        description: updateExisting 
          ? "Property has been updated with latest Zillow data"
          : "Successfully scraped comprehensive property information",
      });

      onDataExtracted(propertyData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape property data';
      console.error('Enhanced scraping error:', err);
      setError(errorMessage);
      
      toast({
        title: "Scraping Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (key) {
      case 'bedrooms':
        return `${value} bed${value !== 1 ? 's' : ''}`;
      case 'bathrooms':
        return `${value} bath${value !== 1 ? 's' : ''}`;
      case 'square_feet':
        return `${value?.toLocaleString()} sq ft`;
      case 'estimated_value':
      case 'price':
      case 'rent_estimate':
      case 'hoa_fees':
      case 'property_taxes':
        return `$${value?.toLocaleString()}`;
      case 'year_built':
        return `Built ${value}`;
      case 'property_type':
        return value?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      case 'walkability_score':
      case 'school_rating':
      case 'neighborhood_score':
        return `${value}/100`;
      case 'price_per_sqft':
        return `$${value}/sq ft`;
      case 'days_on_market':
        return `${value} days`;
      case 'images':
        return `${value?.length || 0} images`;
      case 'amenities':
        return `${value?.length || 0} amenities`;
      default:
        return value?.toString() || 'N/A';
    }
  };

  const getDataCategories = () => {
    if (!scrapedData) return {};
    
    return {
      basic: {
        title: 'Property Details',
        icon: Home,
        fields: ['address', 'city', 'state', 'zip_code', 'bedrooms', 'bathrooms', 'square_feet', 'property_type', 'year_built', 'lot_size']
      },
      financial: {
        title: 'Financial Information',
        icon: DollarSign,
        fields: ['price', 'estimated_value', 'rent_estimate', 'hoa_fees', 'property_taxes', 'price_per_sqft']
      },
      market: {
        title: 'Market Data',
        icon: TrendingUp,
        fields: ['days_on_market', 'walkability_score', 'school_rating', 'neighborhood_score']
      },
      features: {
        title: 'Features & Amenities',
        icon: Map,
        fields: ['images', 'amenities', 'nearby_attractions', 'energy_efficiency_rating']
      }
    };
  };

  const categories = getDataCategories();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Enhanced Zillow Integration
        </CardTitle>
        <CardDescription>
          Import comprehensive property data with market insights and analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scrape">Import Data</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="sync">Auto-Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="scrape" className="space-y-4">
            <div className="space-y-4">
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
                    onClick={() => handleScrape(false)} 
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

              {existingProperty && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Update existing property data</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScrape(true)}
                    disabled={isLoading || !zillowUrl}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Update Property
                  </Button>
                </div>
              )}

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scraping property data...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {scrapedData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    Successfully extracted {Object.keys(scrapedData).filter(k => scrapedData[k as keyof PropertyData] != null).length} data points
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(categories).map(([key, category]) => {
                    const Icon = category.icon;
                    const validFields = category.fields.filter(field => 
                      scrapedData[field as keyof PropertyData] != null
                    );
                    
                    if (validFields.length === 0) return null;
                    
                    return (
                      <Card key={key}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {category.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {validFields.map(field => (
                              <div key={field} className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground capitalize">
                                  {field.replace('_', ' ')}:
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {formatValue(field, scrapedData[field as keyof PropertyData])}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {scrapedData.images && scrapedData.images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Property Images ({scrapedData.images.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {scrapedData.images.slice(0, 8).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data extracted yet</p>
                <p className="text-sm text-muted-foreground">Import from Zillow to see results here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Set up automatic data synchronization to keep property information current with market changes.
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sync Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Market Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically check for price and market changes
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Comparable Sales Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when similar properties sell nearby
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Setup
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Value Trend Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        Monthly property value trend reports
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p><strong>Pro Tips:</strong></p>
          <p>• Use property detail pages (homedetails/) for best results</p>
          <p>• Enable auto-sync to track market changes over time</p>
          <p>• Data includes Zestimate, rent estimates, and neighborhood insights</p>
        </div>
      </CardContent>
    </Card>
  );
};