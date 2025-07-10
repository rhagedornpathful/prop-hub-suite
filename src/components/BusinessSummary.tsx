import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Building, DollarSign, Shield } from "lucide-react";
import { useBusinessSummary } from "@/hooks/queries/useBusinessSummary";
import { useRealtime } from "@/hooks/useRealtime";

export function BusinessSummary() {
  const { data, isLoading, error } = useBusinessSummary();
  
  // Enable real-time updates
  useRealtime();

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
          <p className="text-muted-foreground">Unable to load business summary</p>
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
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{data?.newHouseWatchingClients || 0}</div>
            )}
            <div className="text-sm text-muted-foreground">New House Watching Clients</div>
          </div>

          {/* Rental Properties */}
          <div className="text-center p-4 bg-gradient-primary/10 rounded-lg hover:bg-gradient-primary/20 transition-colors duration-200">
            <Building className="h-8 w-8 text-primary mx-auto mb-2" />
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{data?.newRentalProperties || 0}</div>
            )}
            <div className="text-sm text-muted-foreground">New Rental Properties</div>
          </div>

          {/* Combined Revenue */}
          <div className="text-center p-4 bg-gradient-success/10 rounded-lg hover:bg-gradient-success/20 transition-colors duration-200">
            <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                ${(data?.combinedRevenue || 0).toLocaleString()}
              </div>
            )}
            <div className="text-sm text-muted-foreground">Combined Revenue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}