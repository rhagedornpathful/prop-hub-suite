import React, { useState } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, PlayCircle, Zap, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { SelectCheckTypeDialog } from '@/components/SelectCheckTypeDialog';

export default function MobilePropertyChecks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectTypeDialogOpen, setSelectTypeDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Fetch assigned properties
  const { data: assignedProperties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['house-watcher-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: watcherData } = await supabase
        .from('house_watchers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!watcherData) return [];

      const { data, error } = await supabase
        .from('house_watcher_properties')
        .select(`
          *,
          property:properties(*)
        `)
        .eq('house_watcher_id', watcherData.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch upcoming scheduled checks
  const { data: scheduledChecks = [], isLoading: loadingChecks } = useQuery({
    queryKey: ['scheduled-checks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('property_check_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      // Fetch property details separately
      const checksWithProperties = await Promise.all(
        (data || []).map(async (check) => {
          const { data: property } = await supabase
            .from('properties')
            .select('*')
            .eq('id', check.property_id)
            .single();
          
          return { ...check, property };
        })
      );

      return checksWithProperties;
    },
    enabled: !!user?.id,
  });

  const handleStartCheck = (property: any) => {
    setSelectedProperty(property);
    setSelectTypeDialogOpen(true);
  };

  const handleCheckTypeSelected = (checkType: 'quick' | 'full') => {
    if (selectedProperty) {
      // Navigate to appropriate check page with check type
      navigate(`/mobile/property-check/${selectedProperty.property.id}?type=${checkType}`);
    }
  };

  if (loadingProperties || loadingChecks) {
    return (
      <MobileLayout title="Property Checks">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Property Checks">
      <div className="p-4 space-y-6">
        {/* Scheduled Checks */}
        {scheduledChecks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Scheduled
            </h2>
            {scheduledChecks.map((check) => (
              <Card key={check.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate mb-1">
                        {check.property?.address}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {check.property?.city}, {check.property?.state}
                        </span>
                      </div>
                    </div>
                    <Badge variant={check.check_type === 'quick' ? 'default' : 'secondary'} className="flex-shrink-0">
                      {check.check_type === 'quick' ? (
                        <><Zap className="h-3 w-3 mr-1" />Quick</>
                      ) : (
                        <><ClipboardList className="h-3 w-3 mr-1" />Full</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(check.scheduled_date), 'MMM d, yyyy')}
                    </div>
                    {check.scheduled_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {check.scheduled_time}
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => navigate(`/mobile/property-check/${check.property_id}?type=${check.check_type}`)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Check
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My Properties */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            My Properties
          </h2>
          {assignedProperties.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No properties assigned yet
                </p>
              </CardContent>
            </Card>
          ) : (
            assignedProperties.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate mb-1">
                        {assignment.property.address}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {assignment.property.city}, {assignment.property.state}
                        </span>
                      </div>
                    </div>
                  </div>

                  {assignment.notes && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {assignment.notes}
                    </p>
                  )}

                  <Button 
                    className="w-full" 
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartCheck(assignment)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start New Check
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <SelectCheckTypeDialog
        open={selectTypeDialogOpen}
        onOpenChange={setSelectTypeDialogOpen}
        onSelectType={handleCheckTypeSelected}
        propertyAddress={selectedProperty?.property?.address}
      />
    </MobileLayout>
  );
}
