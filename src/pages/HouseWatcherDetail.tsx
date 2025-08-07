import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AssignPropertiesDialog from "@/components/AssignPropertiesDialog";

const HouseWatcherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: watcher, isLoading, error } = useQuery({
    queryKey: ["house-watcher", id],
    queryFn: async () => {
      if (!id) throw new Error("House watcher ID is required");

      // Get house watcher data
      const { data: watcherData, error: watcherError } = await supabase
        .from('house_watchers')
        .select('*')
        .eq('id', id)
        .single();

      if (watcherError) throw watcherError;

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, address, city, state, zip_code, user_id')
        .eq('user_id', watcherData.user_id)
        .limit(1)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Get assigned properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('house_watcher_properties')
        .select(`
          *,
          properties:property_id(
            id,
            address,
            city,
            state,
            property_type,
            monthly_rent
          )
        `)
        .eq('house_watcher_id', id);

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
      }

      return {
        ...watcherData,
        user_profiles: profileData,
        assigned_properties: propertiesData || []
      };
    },
    enabled: !!id
  });

  const getDisplayName = () => {
    if (!watcher?.user_profiles) return 'Unknown';
    return watcher.user_profiles.first_name && watcher.user_profiles.last_name
      ? `${watcher.user_profiles.first_name} ${watcher.user_profiles.last_name}`
      : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading house watcher details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !watcher) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">House Watcher Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The house watcher you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate('/house-watching')}>
                Return to House Watchers
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/house-watching')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to House Watchers
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{getDisplayName()}</h1>
            <p className="text-muted-foreground">House Watcher Profile</p>
          </div>

          <AssignPropertiesDialog
            watcherId={watcher.id}
            watcherName={getDisplayName()}
            onAssignmentComplete={() => {
              window.location.reload();
            }}
          >
            <Button className="bg-gradient-primary hover:bg-primary-dark">
              <Building2 className="h-4 w-4 mr-2" />
              Assign Properties
            </Button>
          </AssignPropertiesDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                  <span>
                    {watcher.user_profiles?.first_name?.charAt(0) || 'H'}
                    {watcher.user_profiles?.last_name?.charAt(0) || 'W'}
                  </span>
                </div>
                <CardTitle className="text-xl">{getDisplayName()}</CardTitle>
                <Badge variant="outline" className="mx-auto">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  House Watcher
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Information */}
                {watcher.user_profiles?.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground break-all">
                      {watcher.user_profiles.email}
                    </span>
                  </div>
                )}

                {watcher.user_profiles?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {watcher.user_profiles.phone}
                    </span>
                  </div>
                )}

                {/* Address */}
                {(watcher.user_profiles?.address || watcher.user_profiles?.city) && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-muted-foreground">
                      {watcher.user_profiles.address && (
                        <div>{watcher.user_profiles.address}</div>
                      )}
                      {(watcher.user_profiles.city || watcher.user_profiles.state) && (
                        <div>
                          {[watcher.user_profiles.city, watcher.user_profiles.state, watcher.user_profiles.zip_code]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assigned Properties</span>
                    <span className="font-semibold">{watcher.assigned_properties?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span className="font-semibold text-sm">{formatDate(watcher.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assigned Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Assigned Properties ({watcher.assigned_properties?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {watcher.assigned_properties && watcher.assigned_properties.length > 0 ? (
                  <div className="space-y-4">
                    {watcher.assigned_properties.map((assignment: any) => (
                      <div 
                        key={assignment.id}
                        className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">
                              {assignment.properties?.address || 'Unknown Address'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {[assignment.properties?.city, assignment.properties?.state]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                            {assignment.properties?.property_type && (
                              <Badge variant="outline" className="text-xs">
                                {assignment.properties.property_type}
                              </Badge>
                            )}
                          </div>
                          {assignment.properties?.monthly_rent && (
                            <div className="text-right">
                              <div className="font-semibold">
                                ${assignment.properties.monthly_rent.toLocaleString()}/mo
                              </div>
                            </div>
                          )}
                        </div>
                        {assignment.notes && (
                          <div className="mt-3 p-3 bg-muted rounded text-sm">
                            <strong>Notes:</strong> {assignment.notes}
                          </div>
                        )}
                        <div className="mt-3 text-xs text-muted-foreground">
                          Assigned: {formatDate(assignment.assigned_date)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Properties Assigned</h3>
                    <p className="text-muted-foreground text-sm">
                      This house watcher hasn't been assigned any properties yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Recent Activity</h3>
                  <p className="text-muted-foreground text-sm">
                    Activity tracking will appear here once property checks begin.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseWatcherDetail;