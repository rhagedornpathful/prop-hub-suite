import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface PropertyPerformanceMetricsProps {
  totalProperties: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
  maintenanceRequests: {
    total: number;
    pending: number;
    urgent: number;
    completed: number;
  };
  averageRent: number;
  portfolioGrowth: number;
}

export const PropertyPerformanceMetrics: React.FC<PropertyPerformanceMetricsProps> = ({
  totalProperties,
  occupancyRate,
  totalMonthlyRevenue,
  maintenanceRequests,
  averageRent,
  portfolioGrowth
}) => {
  const getOccupancyColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProperties}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getGrowthIcon(portfolioGrowth)}
            <span>{Math.abs(portfolioGrowth)}% from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getOccupancyColor(occupancyRate)}`}>
            {occupancyRate.toFixed(1)}%
          </div>
          <Progress value={occupancyRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {occupancyRate >= 95 ? 'Excellent' : occupancyRate >= 85 ? 'Good' : 'Needs Attention'}
          </p>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalMonthlyRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Avg: ${averageRent.toLocaleString()} per unit
          </p>
        </CardContent>
      </Card>

      {/* Maintenance Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{maintenanceRequests.total}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {maintenanceRequests.urgent > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {maintenanceRequests.urgent} urgent
              </Badge>
            )}
            {maintenanceRequests.pending > 0 && (
              <Badge variant="secondary" className="text-xs">
                {maintenanceRequests.pending} pending
              </Badge>
            )}
            {maintenanceRequests.completed > 0 && (
              <Badge variant="outline" className="text-xs">
                {maintenanceRequests.completed} completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};