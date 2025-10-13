import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Camera, AlertTriangle, Home, MapPin, ArrowLeft, ArrowRight, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CheckSession {
  id: string;
  property_id: string;
  status: string;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  general_notes?: string;
  check_type?: string;
}

interface AssignedProperty {
  id: string;
  property_id: string;
  properties: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
}

const HouseWatcherMobileChecks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'type' | 'property' | 'summary'>(('type'));
  const [checkType, setCheckType] = useState<'quick' | 'full'>('full');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // Fetch assigned properties
  const { data: assignedProperties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['house-watcher-properties'],
    queryFn: async (): Promise<AssignedProperty[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: houseWatcher } = await supabase
        .from('house_watchers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!houseWatcher) return [];

      const { data } = await supabase
        .from('house_watcher_properties')
        .select(`
          id,
          property_id,
          properties (
            id,
            address,
            city,
            state
          )
        `)
        .eq('house_watcher_id', houseWatcher.id);

      return data || [];
    }
  });

  // Start new check session
  const startCheckMutation = useMutation({
    mutationFn: async ({ propertyId, checkType }: { propertyId: string; checkType: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('home_check_sessions')
        .insert({
          user_id: user.id,
          property_id: propertyId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          check_type: checkType as 'quick' | 'full',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['check-sessions'] });
      navigate(`/house-watcher/check/${session.property_id}`);
      toast({
        title: "Check Started",
        description: `${checkType === 'full' ? 'Full' : 'Quick'} check session has been started.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start check session",
        variant: "destructive",
      });
    }
  });

  const handleStartCheck = () => {
    if (!selectedPropertyId) {
      toast({
        title: "Property Required",
        description: "Please select a property to check",
        variant: "destructive",
      });
      return;
    }
    startCheckMutation.mutate({ propertyId: selectedPropertyId, checkType });
  };

  const selectedProperty = assignedProperties.find(p => p.property_id === selectedPropertyId);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'property') setStep('type');
              else if (step === 'summary') setStep('property');
              else navigate('/house-watcher-home');
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Start Property Check</h1>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mt-4">
          <div className={`flex-1 h-2 rounded-full ${step === 'type' || step === 'property' || step === 'summary' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex-1 h-2 rounded-full ${step === 'property' || step === 'summary' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex-1 h-2 rounded-full ${step === 'summary' ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      </div>

      {/* Step 1: Select Check Type */}
      {step === 'type' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Check Type</CardTitle>
              <CardDescription>Choose the type of property check you want to perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={checkType} onValueChange={(value: 'quick' | 'full') => setCheckType(value)}>
                {/* Quick Check */}
                <Card 
                  className={`cursor-pointer transition-all ${checkType === 'quick' ? 'border-primary border-2 bg-primary/5' : 'border-border'}`}
                  onClick={() => setCheckType('quick')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="quick" id="quick" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="quick" className="flex items-center gap-2 cursor-pointer text-base font-semibold">
                          <Zap className="h-5 w-5 text-primary" />
                          Quick Check
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          ~15 minutes • Basic walkthrough covering essential areas
                        </p>
                        <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-7">
                          <li>• Exterior condition</li>
                          <li>• Entry points security</li>
                          <li>• Basic interior check</li>
                          <li>• Quick photo documentation</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Check */}
                <Card 
                  className={`cursor-pointer transition-all ${checkType === 'full' ? 'border-primary border-2 bg-primary/5' : 'border-border'}`}
                  onClick={() => setCheckType('full')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="full" id="full" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="full" className="flex items-center gap-2 cursor-pointer text-base font-semibold">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          Full Check
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          ~45 minutes • Comprehensive inspection of all areas
                        </p>
                        <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-7">
                          <li>• Complete exterior inspection</li>
                          <li>• All interior rooms & systems</li>
                          <li>• HVAC, plumbing, electrical checks</li>
                          <li>• Detailed photo documentation</li>
                          <li>• Full written report</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>

              <Button 
                onClick={() => setStep('property')} 
                className="w-full"
                size="lg"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Select Property */}
      {step === 'property' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Property</CardTitle>
              <CardDescription>Choose the property you want to check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingProperties ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
                  <p>Loading your assigned properties...</p>
                </div>
              ) : assignedProperties.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No Properties Assigned</p>
                  <p className="text-xs mt-1">Contact your administrator to get property assignments</p>
                </div>
              ) : (
                <RadioGroup value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  {assignedProperties.map((property) => (
                    <Card 
                      key={property.id}
                      className={`cursor-pointer transition-all ${selectedPropertyId === property.property_id ? 'border-primary border-2 bg-primary/5' : 'border-border'}`}
                      onClick={() => setSelectedPropertyId(property.property_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={property.property_id} id={property.property_id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={property.property_id} className="cursor-pointer font-medium">
                              {property.properties.address}
                            </Label>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {property.properties.city}, {property.properties.state}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              )}

              <Button 
                onClick={() => setStep('summary')} 
                className="w-full"
                size="lg"
                disabled={!selectedPropertyId || loadingProperties}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Summary & Start */}
      {step === 'summary' && selectedProperty && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review & Start Check</CardTitle>
              <CardDescription>Confirm the details below to start your check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Check Type Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Check Type</span>
                  <Badge variant={checkType === 'full' ? 'default' : 'secondary'} className="gap-1">
                    {checkType === 'full' ? <CheckCircle2 className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                    {checkType === 'full' ? 'Full Check' : 'Quick Check'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {checkType === 'full' ? '~45 minutes • Comprehensive inspection' : '~15 minutes • Basic walkthrough'}
                </div>
              </div>

              {/* Property Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Property</div>
                <div className="font-medium">{selectedProperty.properties.address}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedProperty.properties.city}, {selectedProperty.properties.state}
                </div>
              </div>

              {/* Estimated Time */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Estimated Duration:</span>
                  <span>{checkType === 'full' ? '45 minutes' : '15 minutes'}</span>
                </div>
              </div>

              <Button 
                onClick={handleStartCheck}
                className="w-full"
                size="lg"
                disabled={startCheckMutation.isPending}
              >
                <Camera className="h-4 w-4 mr-2" />
                {startCheckMutation.isPending ? 'Starting Check...' : 'Start Check Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HouseWatcherMobileChecks;