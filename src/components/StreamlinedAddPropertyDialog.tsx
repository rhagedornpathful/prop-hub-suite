import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Search, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Building,
  Users,
  Zap,
  ArrowRight,
  Home
} from "lucide-react";

interface StreamlinedAddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyAdded?: () => void;
  editProperty?: any;
}

interface PropertyOwner {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

interface PropertyData {
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  service_type: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  estimated_value?: number;
  monthly_rent?: number;
  owner_id?: string;
}

export function StreamlinedAddPropertyDialog({ 
  open, 
  onOpenChange, 
  onPropertyAdded, 
  editProperty 
}: StreamlinedAddPropertyDialogProps) {
  const [step, setStep] = useState<'zillow' | 'assign' | 'confirm'>('zillow');
  const [zillowUrl, setZillowUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    address: "",
    service_type: "property_management"
  });
  const [propertyOwners, setPropertyOwners] = useState<PropertyOwner[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  // Load property owners when dialog opens
  useEffect(() => {
    if (open) {
      loadPropertyOwners();
      // Reset to first step
      setStep('zillow');
      setZillowUrl("");
      setPropertyData({
        address: "",
        service_type: "property_management"
      });
    }
  }, [open]);

  const loadPropertyOwners = async () => {
    setIsLoadingOwners(true);
    try {
      const { data, error } = await supabase
        .from('property_owners')
        .select('id, first_name, last_name, company_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPropertyOwners(data || []);
    } catch (error) {
      console.error('Error loading property owners:', error);
    } finally {
      setIsLoadingOwners(false);
    }
  };

  const getOwnerDisplayName = (owner: PropertyOwner) => {
    return owner.company_name || `${owner.first_name} ${owner.last_name}`;
  };

  const isValidZillowUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('zillow.com') && 
             (url.includes('/homedetails/') || url.includes('/homes/'));
    } catch {
      return false;
    }
  };

  const handleZillowSearch = async () => {
    if (!zillowUrl.trim()) {
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

    setIsSearching(true);
     setSearchProgress(0);

    try {
      console.log('Starting Zillow search with URL:', zillowUrl);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke('scrape-property', {
        body: { url: zillowUrl }
      });

      clearInterval(progressInterval);
      setSearchProgress(100);

      if (error) throw error;

      if (data?.success && data?.propertyData) {
        setPropertyData({
          ...propertyData,
          ...data.propertyData,
          address: data.propertyData.address || propertyData.address,
        });
        
        toast({
          title: "Property Found! 🎉",
          description: "Successfully imported property data from Zillow",
        });
        
        setStep('assign');
      } else {
        throw new Error('Could not extract property data');
      }
    } catch (error: any) {
      console.error('Error searching property:', error);
      
      let errorMessage = "Could not import from Zillow. You can add manually instead.";
      
      if (error?.message) {
        errorMessage = `Zillow import failed: ${error.message}`;
      }
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setSearchProgress(0);
    }
  };

  const handleManualAdd = () => {
    setStep('assign');
  };

  const handleSaveProperty = async () => {
    if (!propertyData.address || !propertyData.owner_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Extract owner_id before sending to database
      const { owner_id, ...propertyDataWithoutOwnerId } = propertyData;

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyDataWithoutOwnerId,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create owner association
      if (owner_id) {
        await supabase
          .from('property_owner_associations')
          .insert({
            property_id: data.id,
            property_owner_id: owner_id,
            ownership_percentage: 100,
            is_primary_owner: true,
          });
      }

      toast({
        title: "Success! 🏠",
        description: "Property added successfully!",
      });

      onPropertyAdded?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderZillowStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Import from Zillow</h3>
        <p className="text-muted-foreground text-sm">
          Get comprehensive property data automatically
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zillow-url">Zillow Property URL</Label>
              <Input
                id="zillow-url"
                type="url"
                value={zillowUrl}
                onChange={(e) => setZillowUrl(e.target.value)}
                placeholder="https://www.zillow.com/homedetails/..."
                disabled={isSearching}
              />
              {zillowUrl && !isValidZillowUrl(zillowUrl) && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Please enter a valid Zillow property URL
                </p>
              )}
            </div>

            {isSearching && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing property data...</span>
                  <span>{searchProgress}%</span>
                </div>
                <Progress value={searchProgress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={handleZillowSearch} 
              disabled={isSearching || !zillowUrl} 
              className="w-full"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Import Property Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={handleManualAdd} 
        className="w-full"
        size="lg"
      >
        <Building className="w-4 h-4 mr-2" />
        Add Manually Instead
      </Button>
    </div>
  );

  const renderAssignStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Assign & Configure</h3>
        <p className="text-muted-foreground text-sm">
          Set ownership and service details
        </p>
      </div>

      {propertyData.address && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Property Imported</span>
            </div>
            <p className="font-medium">{propertyData.address}</p>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              {propertyData.bedrooms && <span>{propertyData.bedrooms} bed</span>}
              {propertyData.bathrooms && <span>{propertyData.bathrooms} bath</span>}
              {propertyData.square_feet && <span>{propertyData.square_feet.toLocaleString()} sq ft</span>}
            </div>
            {propertyData.estimated_value && (
              <div className="mt-2">
                <Badge variant="secondary">
                  Est. Value: ${propertyData.estimated_value.toLocaleString()}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {!propertyData.address && (
          <div className="space-y-2">
            <Label htmlFor="address">Property Address *</Label>
            <Input
              id="address"
              value={propertyData.address}
              onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
              placeholder="123 Main Street, City, State 12345"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="service-type">Service Type *</Label>
          <Select 
            value={propertyData.service_type} 
            onValueChange={(value) => setPropertyData({ ...propertyData, service_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property_management">Property Management</SelectItem>
              <SelectItem value="house_watching">House Watching</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Property Owner *</Label>
          <Select 
            value={propertyData.owner_id} 
            onValueChange={(value) => setPropertyData({ ...propertyData, owner_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an owner" />
            </SelectTrigger>
            <SelectContent>
              {propertyOwners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {getOwnerDisplayName(owner)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {propertyData.monthly_rent && (
          <div className="space-y-2">
            <Label htmlFor="rent">Monthly Rent</Label>
            <Input
              id="rent"
              type="number"
              value={propertyData.monthly_rent}
              onChange={(e) => setPropertyData({ ...propertyData, monthly_rent: Number(e.target.value) })}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setStep('zillow')} 
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleSaveProperty}
          disabled={!propertyData.address || !propertyData.owner_id || isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Add Property
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Add New Property
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'zillow' ? 'bg-blue-600 text-white' : 
                step === 'assign' || step === 'confirm' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                1
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'assign' ? 'bg-blue-600 text-white' : 
                step === 'confirm' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                2
              </div>
            </div>
          </div>

          {step === 'zillow' && renderZillowStep()}
          {step === 'assign' && renderAssignStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}