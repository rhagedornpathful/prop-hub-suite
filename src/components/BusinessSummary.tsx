import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Building, DollarSign, Shield } from "lucide-react";

interface BusinessSummaryData {
  newHouseWatchingClients: number;
  newRentalProperties: number;
  combinedRevenue: number;
}

export function BusinessSummary() {
  const [data, setData] = useState<BusinessSummaryData>({
    newHouseWatchingClients: 0,
    newRentalProperties: 0,
    combinedRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessSummary();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('business-summary-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'properties'
      }, () => {
        fetchBusinessSummary();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'house_watching'
      }, () => {
        fetchBusinessSummary();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBusinessSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("User not authenticated");
        return;
      }

      // Get current month start
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      // Fetch new rental properties this month
      const { data: newProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, monthly_rent')
        .eq('user_id', userData.user.id)
        .gte('created_at', currentMonth.toISOString());

      if (propertiesError) throw propertiesError;

      // Fetch new house watching clients this month
      const { data: newHouseWatching, error: houseWatchingError } = await supabase
        .from('house_watching')
        .select('id, monthly_fee')
        .eq('user_id', userData.user.id)
        .gte('created_at', currentMonth.toISOString());

      if (houseWatchingError) throw houseWatchingError;

      // Calculate combined revenue
      const propertyRevenue = newProperties?.reduce((sum, prop) => sum + (prop.monthly_rent || 0), 0) || 0;
      const houseWatchingRevenue = newHouseWatching?.reduce((sum, hw) => sum + (hw.monthly_fee || 0), 0) || 0;

      setData({
        newHouseWatchingClients: newHouseWatching?.length || 0,
        newRentalProperties: newProperties?.length || 0,
        combinedRevenue: propertyRevenue + houseWatchingRevenue
      });
    } catch (error) {
      console.error('Error fetching business summary:', error);
      setError("Failed to load business summary");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="shadow-md border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TrendingUp className="h-5 w-5" />
            Business Summary Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-0 hover-scale transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          This Month's Business Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* House Watching Clients */}
          <div className="text-center p-4 bg-gradient-accent/10 rounded-lg hover:bg-gradient-accent/20 transition-colors duration-200">
            <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{data.newHouseWatchingClients}</div>
            )}
            <div className="text-sm text-muted-foreground">New House Watching Clients</div>
          </div>

          {/* Rental Properties */}
          <div className="text-center p-4 bg-gradient-primary/10 rounded-lg hover:bg-gradient-primary/20 transition-colors duration-200">
            <Building className="h-8 w-8 text-primary mx-auto mb-2" />
            {loading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{data.newRentalProperties}</div>
            )}
            <div className="text-sm text-muted-foreground">New Rental Properties</div>
          </div>

          {/* Combined Revenue */}
          <div className="text-center p-4 bg-gradient-success/10 rounded-lg hover:bg-gradient-success/20 transition-colors duration-200">
            <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
            {loading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                ${data.combinedRevenue.toLocaleString()}
              </div>
            )}
            <div className="text-sm text-muted-foreground">Combined Revenue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}